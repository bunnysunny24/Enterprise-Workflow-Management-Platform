package com.enterprise.workflow.service;

import com.enterprise.workflow.config.CustomUserDetails;
import com.enterprise.workflow.dto.request.WorkflowActionRequest;
import com.enterprise.workflow.dto.request.WorkflowInstanceCreateRequest;
import com.enterprise.workflow.dto.response.WorkflowInstanceResponse;
import com.enterprise.workflow.dto.response.WorkflowStepResponse;
import com.enterprise.workflow.entity.*;
import com.enterprise.workflow.exception.ResourceNotFoundException;
import com.enterprise.workflow.exception.UnauthorizedActionException;
import com.enterprise.workflow.exception.WorkflowValidationException;
import com.enterprise.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowInstanceService {

    private final WorkflowInstanceRepository instanceRepository;
    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowStepRepository stepRepository;
    private final WorkflowAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final WorkflowDefinitionService definitionService;

    @Transactional
    public WorkflowInstanceResponse createInstance(WorkflowInstanceCreateRequest request) {
        User currentUser = getCurrentUser();

        WorkflowDefinition definition = definitionRepository.findById(request.getWorkflowDefinitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Workflow definition not found with id: " + request.getWorkflowDefinitionId()));

        if (definition.getStatus() != WorkflowDefinition.Status.ACTIVE) {
            throw new WorkflowValidationException("Workflow definition is not currently active");
        }

        List<WorkflowStep> steps = definition.getSteps();
        if (steps == null || steps.isEmpty()) {
            throw new WorkflowValidationException("Workflow definition has no configured steps");
        }

        // Identify initial step
        WorkflowStep initialStep = steps.stream()
                .filter(WorkflowStep::isInitialStep)
                .findFirst()
                .orElse(steps.get(0));

        // Generate tracking number e.g. WF-EXP-2026-8921
        String year = DateTimeFormatter.ofPattern("yyyy").format(LocalDateTime.now());
        int randomSuffix = ThreadLocalRandom.current().nextInt(1000, 9999);
        String trackingNumber = String.format("WF-%s-%s-%04d", definition.getCode(), year, randomSuffix);

        int slaHours = definition.getSlaHours() != null ? definition.getSlaHours() : 48;
        LocalDateTime slaDeadline = LocalDateTime.now().plusHours(slaHours);

        WorkflowInstance instance = WorkflowInstance.builder()
                .trackingNumber(trackingNumber)
                .workflowDefinition(definition)
                .title(request.getTitle())
                .priority(request.getPriority() != null ? request.getPriority() : WorkflowInstance.Priority.MEDIUM)
                .currentStep(initialStep)
                .initiator(currentUser)
                .status(WorkflowInstance.InstanceStatus.IN_PROGRESS)
                .payloadJson(request.getPayloadJson())
                .slaDeadline(slaDeadline)
                .build();

        // If initial step is a submission step, advance automatically to step 2 if present
        if (initialStep.getStepType() == WorkflowStep.StepType.SUBMISSION && steps.size() > 1) {
            WorkflowStep nextStep = steps.get(1);
            instance.setCurrentStep(nextStep);
            instance.setStatus(WorkflowInstance.InstanceStatus.WAITING_APPROVAL);
        }

        WorkflowInstance savedInstance = instanceRepository.save(instance);

        // Record initial audit log
        WorkflowAuditLog initialLog = WorkflowAuditLog.builder()
                .instance(savedInstance)
                .stepName(initialStep.getStepName())
                .actionTaken("SUBMITTED")
                .actor(currentUser)
                .previousStatus("NEW")
                .newStatus(savedInstance.getStatus().name())
                .comments("Workflow instance initiated by " + currentUser.getFullName())
                .durationMinutes(0L)
                .build();
        auditLogRepository.save(initialLog);

        return mapToResponse(savedInstance, currentUser);
    }

    @Transactional
    public WorkflowInstanceResponse executeAction(Long instanceId, WorkflowActionRequest actionRequest) {
        User currentUser = getCurrentUser();

        WorkflowInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow instance not found with id: " + instanceId));

        if (instance.getStatus() == WorkflowInstance.InstanceStatus.APPROVED ||
            instance.getStatus() == WorkflowInstance.InstanceStatus.REJECTED ||
            instance.getStatus() == WorkflowInstance.InstanceStatus.CANCELLED) {
            throw new WorkflowValidationException("Cannot execute action on closed workflow instance (Status: " + instance.getStatus() + ")");
        }

        String action = actionRequest.getAction().toUpperCase().trim();
        validateUserCanAct(currentUser, instance, action);

        String previousStatus = instance.getStatus().name();
        WorkflowStep currentStep = instance.getCurrentStep();
        List<WorkflowStep> allSteps = instance.getWorkflowDefinition().getSteps();

        long minutesInStep = 0L;
        if (instance.getUpdatedAt() != null) {
            minutesInStep = Math.max(1L, Duration.between(instance.getUpdatedAt(), LocalDateTime.now()).toMinutes());
        }

        switch (action) {
            case "APPROVE":
                handleApprove(instance, allSteps, currentStep);
                break;
            case "REJECT":
                instance.setStatus(WorkflowInstance.InstanceStatus.REJECTED);
                instance.setCompletedAt(LocalDateTime.now());
                break;
            case "REQUEST_CHANGES":
                // Send back to initial step or initiator
                WorkflowStep firstStep = allSteps.get(0);
                instance.setCurrentStep(firstStep);
                instance.setStatus(WorkflowInstance.InstanceStatus.IN_PROGRESS);
                break;
            case "CANCEL":
                instance.setStatus(WorkflowInstance.InstanceStatus.CANCELLED);
                instance.setCompletedAt(LocalDateTime.now());
                break;
            case "ESCALATE":
                // Keep same step but escalate priority
                instance.setPriority(WorkflowInstance.Priority.CRITICAL);
                break;
            default:
                throw new WorkflowValidationException("Unsupported action: " + action);
        }

        // Assignee override if requested
        if (actionRequest.getNextAssigneeId() != null) {
            userRepository.findById(actionRequest.getNextAssigneeId()).ifPresent(instance::setAssignee);
        }

        WorkflowInstance savedInstance = instanceRepository.save(instance);

        // Record audit trail entry
        WorkflowAuditLog auditLog = WorkflowAuditLog.builder()
                .instance(savedInstance)
                .stepName(currentStep != null ? currentStep.getStepName() : "N/A")
                .actionTaken(action)
                .actor(currentUser)
                .previousStatus(previousStatus)
                .newStatus(savedInstance.getStatus().name())
                .comments(actionRequest.getComments() != null ? actionRequest.getComments() : "Action performed: " + action)
                .durationMinutes(minutesInStep)
                .build();
        auditLogRepository.save(auditLog);

        return mapToResponse(savedInstance, currentUser);
    }

    private void handleApprove(WorkflowInstance instance, List<WorkflowStep> steps, WorkflowStep currentStep) {
        if (currentStep == null) {
            instance.setStatus(WorkflowInstance.InstanceStatus.APPROVED);
            instance.setCompletedAt(LocalDateTime.now());
            return;
        }

        int currentIndex = -1;
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getId().equals(currentStep.getId())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex != -1 && currentIndex + 1 < steps.size()) {
            WorkflowStep nextStep = steps.get(currentIndex + 1);
            instance.setCurrentStep(nextStep);

            if (nextStep.isTerminalStep() || nextStep.getStepType() == WorkflowStep.StepType.COMPLETION) {
                instance.setStatus(WorkflowInstance.InstanceStatus.APPROVED);
                instance.setCompletedAt(LocalDateTime.now());
            } else {
                instance.setStatus(WorkflowInstance.InstanceStatus.WAITING_APPROVAL);
            }
        } else {
            // No further steps -> workflow approved
            instance.setStatus(WorkflowInstance.InstanceStatus.APPROVED);
            instance.setCompletedAt(LocalDateTime.now());
        }
    }

    private void validateUserCanAct(User currentUser, WorkflowInstance instance, String action) {
        boolean isAdmin = currentUser.getRoles().contains(Role.ROLE_ADMIN);
        boolean isInitiator = instance.getInitiator().getId().equals(currentUser.getId());

        if (action.equals("CANCEL")) {
            if (isAdmin || isInitiator) {
                return;
            }
            throw new UnauthorizedActionException("Only initiator or Admin can cancel a workflow");
        }

        if (isAdmin) {
            return; // Admins have master override
        }

        // If specific assignee was designated, only they can act
        if (instance.getAssignee() != null && !instance.getAssignee().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("This workflow step is explicitly assigned to " + instance.getAssignee().getFullName());
        }

        WorkflowStep currentStep = instance.getCurrentStep();
        if (currentStep != null && currentStep.getRequiredRole() != null) {
            Role requiredRole = currentStep.getRequiredRole();
            if (!currentUser.getRoles().contains(requiredRole)) {
                throw new UnauthorizedActionException("Your role does not have permission for step: " + currentStep.getStepName() + ". Required: " + requiredRole);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<WorkflowInstanceResponse> getAllInstances() {
        User currentUser = getCurrentUser();
        return instanceRepository.findAll().stream()
                .sorted(Comparator.comparing(WorkflowInstance::getCreatedAt).reversed())
                .map(i -> mapToResponse(i, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowInstanceResponse getInstanceById(Long id) {
        User currentUser = getCurrentUser();
        WorkflowInstance instance = instanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow instance not found with id: " + id));
        return mapToResponse(instance, currentUser);
    }

    @Transactional(readOnly = true)
    public List<WorkflowInstanceResponse> getMySubmissions() {
        User currentUser = getCurrentUser();
        return instanceRepository.findByInitiatorIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(i -> mapToResponse(i, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowInstanceResponse> getActionablePendingForCurrentUser() {
        User currentUser = getCurrentUser();
        if (currentUser.getRoles().contains(Role.ROLE_ADMIN)) {
            // Admins can see all pending
            return instanceRepository.findAll().stream()
                    .filter(i -> i.getStatus() == WorkflowInstance.InstanceStatus.WAITING_APPROVAL ||
                                 i.getStatus() == WorkflowInstance.InstanceStatus.IN_PROGRESS ||
                                 i.getStatus() == WorkflowInstance.InstanceStatus.PENDING)
                    .sorted(Comparator.comparing(WorkflowInstance::getCreatedAt).reversed())
                    .map(i -> mapToResponse(i, currentUser))
                    .collect(Collectors.toList());
        }

        List<Role> userRoles = new ArrayList<>(currentUser.getRoles());
        return instanceRepository.findActionableForUser(currentUser.getId(), userRoles).stream()
                .map(i -> mapToResponse(i, currentUser))
                .collect(Collectors.toList());
    }

    public WorkflowInstanceResponse mapToResponse(WorkflowInstance instance, User viewingUser) {
        boolean isSlaBreached = instance.getSlaDeadline() != null &&
                LocalDateTime.now().isAfter(instance.getSlaDeadline()) &&
                instance.getStatus() != WorkflowInstance.InstanceStatus.APPROVED &&
                instance.getStatus() != WorkflowInstance.InstanceStatus.REJECTED &&
                instance.getStatus() != WorkflowInstance.InstanceStatus.CANCELLED;

        List<String> availableActions = determineAvailableActions(instance, viewingUser);

        return WorkflowInstanceResponse.builder()
                .id(instance.getId())
                .trackingNumber(instance.getTrackingNumber())
                .workflowDefinitionId(instance.getWorkflowDefinition().getId())
                .workflowName(instance.getWorkflowDefinition().getName())
                .workflowCode(instance.getWorkflowDefinition().getCode())
                .title(instance.getTitle())
                .priority(instance.getPriority())
                .currentStep(instance.getCurrentStep() != null ? definitionService.mapStepToResponse(instance.getCurrentStep()) : null)
                .initiator(authService.mapToSummary(instance.getInitiator()))
                .assignee(instance.getAssignee() != null ? authService.mapToSummary(instance.getAssignee()) : null)
                .status(instance.getStatus())
                .payloadJson(instance.getPayloadJson())
                .slaDeadline(instance.getSlaDeadline())
                .completedAt(instance.getCompletedAt())
                .slaBreached(isSlaBreached)
                .availableActions(availableActions)
                .createdAt(instance.getCreatedAt())
                .updatedAt(instance.getUpdatedAt())
                .build();
    }

    private List<String> determineAvailableActions(WorkflowInstance instance, User viewingUser) {
        List<String> actions = new ArrayList<>();
        if (viewingUser == null) return actions;

        if (instance.getStatus() == WorkflowInstance.InstanceStatus.APPROVED ||
            instance.getStatus() == WorkflowInstance.InstanceStatus.REJECTED ||
            instance.getStatus() == WorkflowInstance.InstanceStatus.CANCELLED) {
            return actions;
        }

        boolean isAdmin = viewingUser.getRoles().contains(Role.ROLE_ADMIN);
        boolean isInitiator = instance.getInitiator().getId().equals(viewingUser.getId());

        if (isInitiator || isAdmin) {
            actions.add("CANCEL");
        }

        boolean canApprove = isAdmin;
        WorkflowStep step = instance.getCurrentStep();
        if (step != null && step.getRequiredRole() != null) {
            if (viewingUser.getRoles().contains(step.getRequiredRole())) {
                canApprove = true;
            }
        }

        if (instance.getAssignee() != null && !instance.getAssignee().getId().equals(viewingUser.getId()) && !isAdmin) {
            canApprove = false;
        }

        if (canApprove) {
            actions.add("APPROVE");
            actions.add("REJECT");
            actions.add("REQUEST_CHANGES");
            actions.add("ESCALATE");
        }

        return actions;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedActionException("User must be authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}

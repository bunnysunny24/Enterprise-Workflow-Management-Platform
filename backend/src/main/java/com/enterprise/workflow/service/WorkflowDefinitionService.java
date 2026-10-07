package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.request.WorkflowDefinitionRequest;
import com.enterprise.workflow.dto.request.WorkflowStepRequest;
import com.enterprise.workflow.dto.response.WorkflowDefinitionResponse;
import com.enterprise.workflow.dto.response.WorkflowStepResponse;
import com.enterprise.workflow.entity.WorkflowDefinition;
import com.enterprise.workflow.entity.WorkflowStep;
import com.enterprise.workflow.exception.ResourceNotFoundException;
import com.enterprise.workflow.exception.WorkflowValidationException;
import com.enterprise.workflow.repository.WorkflowDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowDefinitionService {

    private final WorkflowDefinitionRepository workflowDefinitionRepository;

    @Transactional(readOnly = true)
    public List<WorkflowDefinitionResponse> getAllDefinitions() {
        return workflowDefinitionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowDefinitionResponse> getActiveDefinitions() {
        return workflowDefinitionRepository.findByStatus(WorkflowDefinition.Status.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowDefinitionResponse getDefinitionById(Long id) {
        WorkflowDefinition definition = workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow definition not found with id: " + id));
        return mapToResponse(definition);
    }

    @Transactional
    public WorkflowDefinitionResponse createDefinition(WorkflowDefinitionRequest request) {
        if (workflowDefinitionRepository.existsByCode(request.getCode())) {
            throw new WorkflowValidationException("Workflow code '" + request.getCode() + "' is already in use");
        }

        WorkflowDefinition definition = WorkflowDefinition.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase().trim())
                .description(request.getDescription())
                .department(request.getDepartment())
                .slaHours(request.getSlaHours() != null ? request.getSlaHours() : 48)
                .status(request.getStatus() != null ? request.getStatus() : WorkflowDefinition.Status.ACTIVE)
                .formSchemaJson(request.getFormSchemaJson())
                .version(1)
                .steps(new ArrayList<>())
                .build();

        if (request.getSteps() != null && !request.getSteps().isEmpty()) {
            for (WorkflowStepRequest stepReq : request.getSteps()) {
                WorkflowStep step = WorkflowStep.builder()
                        .workflowDefinition(definition)
                        .stepName(stepReq.getStepName())
                        .stepKey(stepReq.getStepKey())
                        .stepOrder(stepReq.getStepOrder())
                        .requiredRole(stepReq.getRequiredRole())
                        .stepType(stepReq.getStepType() != null ? stepReq.getStepType() : WorkflowStep.StepType.APPROVAL)
                        .timeoutHours(stepReq.getTimeoutHours() != null ? stepReq.getTimeoutHours() : 24)
                        .initialStep(stepReq.isInitialStep())
                        .terminalStep(stepReq.isTerminalStep())
                        .description(stepReq.getDescription())
                        .build();
                definition.getSteps().add(step);
            }
        }

        WorkflowDefinition saved = workflowDefinitionRepository.save(definition);
        return mapToResponse(saved);
    }

    @Transactional
    public WorkflowDefinitionResponse updateDefinition(Long id, WorkflowDefinitionRequest request) {
        WorkflowDefinition definition = workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow definition not found with id: " + id));

        definition.setName(request.getName());
        definition.setDescription(request.getDescription());
        definition.setDepartment(request.getDepartment());
        if (request.getSlaHours() != null) {
            definition.setSlaHours(request.getSlaHours());
        }
        if (request.getStatus() != null) {
            definition.setStatus(request.getStatus());
        }
        if (request.getFormSchemaJson() != null) {
            definition.setFormSchemaJson(request.getFormSchemaJson());
        }

        if (request.getSteps() != null) {
            definition.getSteps().clear();
            for (WorkflowStepRequest stepReq : request.getSteps()) {
                WorkflowStep step = WorkflowStep.builder()
                        .workflowDefinition(definition)
                        .stepName(stepReq.getStepName())
                        .stepKey(stepReq.getStepKey())
                        .stepOrder(stepReq.getStepOrder())
                        .requiredRole(stepReq.getRequiredRole())
                        .stepType(stepReq.getStepType() != null ? stepReq.getStepType() : WorkflowStep.StepType.APPROVAL)
                        .timeoutHours(stepReq.getTimeoutHours() != null ? stepReq.getTimeoutHours() : 24)
                        .initialStep(stepReq.isInitialStep())
                        .terminalStep(stepReq.isTerminalStep())
                        .description(stepReq.getDescription())
                        .build();
                definition.getSteps().add(step);
            }
        }

        WorkflowDefinition saved = workflowDefinitionRepository.save(definition);
        return mapToResponse(saved);
    }

    public WorkflowDefinitionResponse mapToResponse(WorkflowDefinition def) {
        List<WorkflowStepResponse> stepResponses = def.getSteps() != null ? def.getSteps().stream()
                .map(this::mapStepToResponse)
                .collect(Collectors.toList()) : new ArrayList<>();

        return WorkflowDefinitionResponse.builder()
                .id(def.getId())
                .name(def.getName())
                .code(def.getCode())
                .description(def.getDescription())
                .department(def.getDepartment())
                .version(def.getVersion())
                .status(def.getStatus())
                .slaHours(def.getSlaHours())
                .formSchemaJson(def.getFormSchemaJson())
                .steps(stepResponses)
                .createdAt(def.getCreatedAt())
                .updatedAt(def.getUpdatedAt())
                .build();
    }

    public WorkflowStepResponse mapStepToResponse(WorkflowStep step) {
        return WorkflowStepResponse.builder()
                .id(step.getId())
                .stepName(step.getStepName())
                .stepKey(step.getStepKey())
                .stepOrder(step.getStepOrder())
                .requiredRole(step.getRequiredRole())
                .stepType(step.getStepType())
                .timeoutHours(step.getTimeoutHours())
                .initialStep(step.isInitialStep())
                .terminalStep(step.isTerminalStep())
                .description(step.getDescription())
                .build();
    }
}

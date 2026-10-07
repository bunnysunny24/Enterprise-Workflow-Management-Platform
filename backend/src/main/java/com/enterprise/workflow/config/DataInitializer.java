package com.enterprise.workflow.config;

import com.enterprise.workflow.entity.*;
import com.enterprise.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowStepRepository workflowStepRepository;
    private final WorkflowInstanceRepository workflowInstanceRepository;
    private final WorkflowAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with data.");
            return;
        }

        log.info("Seeding initial enterprise users and configurable workflow definitions...");

        // 1. Create Seed Users
        User admin = User.builder()
                .username("admin")
                .email("admin@enterprise.local")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Alexander Wright")
                .department("Executive Management")
                .jobTitle("Chief Information Officer / Admin")
                .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_MANAGER))
                .active(true)
                .build();

        User manager = User.builder()
                .username("sarah.manager")
                .email("sarah.chen@enterprise.local")
                .password(passwordEncoder.encode("Manager@123"))
                .fullName("Sarah Chen")
                .department("Engineering Operations")
                .jobTitle("Engineering Director")
                .roles(Set.of(Role.ROLE_MANAGER))
                .active(true)
                .build();

        User employee = User.builder()
                .username("alex.employee")
                .email("alex.miller@enterprise.local")
                .password(passwordEncoder.encode("Employee@123"))
                .fullName("Alex Miller")
                .department("Software Engineering")
                .jobTitle("Senior Full Stack Developer")
                .roles(Set.of(Role.ROLE_EMPLOYEE))
                .active(true)
                .build();

        User auditor = User.builder()
                .username("elena.auditor")
                .email("elena.rostova@enterprise.local")
                .password(passwordEncoder.encode("Auditor@123"))
                .fullName("Elena Rostova")
                .department("Risk & Compliance")
                .jobTitle("Senior IT Compliance Auditor")
                .roles(Set.of(Role.ROLE_AUDITOR))
                .active(true)
                .build();

        User finance = User.builder()
                .username("mark.finance")
                .email("mark.sterling@enterprise.local")
                .password(passwordEncoder.encode("Manager@123"))
                .fullName("Mark Sterling")
                .department("Finance & Accounting")
                .jobTitle("VP of Financial Planning")
                .roles(Set.of(Role.ROLE_MANAGER))
                .active(true)
                .build();

        userRepository.saveAll(List.of(admin, manager, employee, auditor, finance));

        // 2. Create Workflow Definitions
        // WF 1: Expense Reimbursement
        WorkflowDefinition expDef = WorkflowDefinition.builder()
                .name("Corporate Expense Reimbursement")
                .code("EXPENSE_REIMBURSEMENT")
                .description("Multi-tier approval workflow for employee travel, hardware, and client entertainment expense claims.")
                .department("Finance")
                .version(1)
                .status(WorkflowDefinition.Status.ACTIVE)
                .slaHours(48)
                .formSchemaJson("{\"fields\":[{\"name\":\"amount\",\"type\":\"number\",\"label\":\"Claim Amount ($)\"},{\"name\":\"category\",\"type\":\"select\",\"options\":[\"Travel\",\"Hardware\",\"Software License\",\"Client Meal\"]},{\"name\":\"purpose\",\"type\":\"text\",\"label\":\"Business Justification\"}]}")
                .steps(new ArrayList<>())
                .build();

        WorkflowStep expStep1 = WorkflowStep.builder()
                .workflowDefinition(expDef)
                .stepName("Submit Expense Report")
                .stepKey("EXP_SUBMIT")
                .stepOrder(1)
                .requiredRole(Role.ROLE_EMPLOYEE)
                .stepType(WorkflowStep.StepType.SUBMISSION)
                .timeoutHours(24)
                .initialStep(true)
                .terminalStep(false)
                .description("Employee itemizes receipts and enters business purpose.")
                .build();

        WorkflowStep expStep2 = WorkflowStep.builder()
                .workflowDefinition(expDef)
                .stepName("Line Manager Review")
                .stepKey("EXP_MGR_REVIEW")
                .stepOrder(2)
                .requiredRole(Role.ROLE_MANAGER)
                .stepType(WorkflowStep.StepType.REVIEW)
                .timeoutHours(24)
                .initialStep(false)
                .terminalStep(false)
                .description("Direct manager verifies relevance to business deliverables.")
                .build();

        WorkflowStep expStep3 = WorkflowStep.builder()
                .workflowDefinition(expDef)
                .stepName("Finance Disbursal Approval")
                .stepKey("EXP_FIN_APPROVAL")
                .stepOrder(3)
                .requiredRole(Role.ROLE_MANAGER)
                .stepType(WorkflowStep.StepType.APPROVAL)
                .timeoutHours(24)
                .initialStep(false)
                .terminalStep(false)
                .description("Finance team verifies receipt tax compliance and authorizes disbursement.")
                .build();

        WorkflowStep expStep4 = WorkflowStep.builder()
                .workflowDefinition(expDef)
                .stepName("Reimbursement Completed")
                .stepKey("EXP_COMPLETED")
                .stepOrder(4)
                .requiredRole(Role.ROLE_ADMIN)
                .stepType(WorkflowStep.StepType.COMPLETION)
                .timeoutHours(0)
                .initialStep(false)
                .terminalStep(true)
                .description("Payment wired to employee corporate account.")
                .build();

        expDef.getSteps().addAll(List.of(expStep1, expStep2, expStep3, expStep4));
        WorkflowDefinition savedExpDef = workflowDefinitionRepository.save(expDef);

        // WF 2: IT Access Provisioning
        WorkflowDefinition itDef = WorkflowDefinition.builder()
                .name("IT Security & Cloud Access Provisioning")
                .code("IT_ACCESS_PROVISION")
                .description("Compliance-tracked workflow for production infrastructure, AWS IAM roles, and internal repository access.")
                .department("Information Technology")
                .version(1)
                .status(WorkflowDefinition.Status.ACTIVE)
                .slaHours(24)
                .formSchemaJson("{\"fields\":[{\"name\":\"system\",\"type\":\"select\",\"options\":[\"AWS Production\",\"Kubernetes Cluster\",\"GitHub Org Admin\",\"Datadog Logs\"]},{\"name\":\"durationDays\",\"type\":\"number\",\"label\":\"Access Duration (Days)\"},{\"name\":\"ticketRef\",\"type\":\"text\",\"label\":\"Jira / Incident Ticket Ref\"}]}")
                .steps(new ArrayList<>())
                .build();

        WorkflowStep itStep1 = WorkflowStep.builder()
                .workflowDefinition(itDef)
                .stepName("Access Request Submission")
                .stepKey("IT_SUBMIT")
                .stepOrder(1)
                .requiredRole(Role.ROLE_EMPLOYEE)
                .stepType(WorkflowStep.StepType.SUBMISSION)
                .timeoutHours(12)
                .initialStep(true)
                .terminalStep(false)
                .description("Staff requests elevated IAM or infrastructure privilege.")
                .build();

        WorkflowStep itStep2 = WorkflowStep.builder()
                .workflowDefinition(itDef)
                .stepName("Team Lead Verification")
                .stepKey("IT_LEAD_REVIEW")
                .stepOrder(2)
                .requiredRole(Role.ROLE_MANAGER)
                .stepType(WorkflowStep.StepType.REVIEW)
                .timeoutHours(12)
                .initialStep(false)
                .terminalStep(false)
                .description("Manager endorses principle of least privilege.")
                .build();

        WorkflowStep itStep3 = WorkflowStep.builder()
                .workflowDefinition(itDef)
                .stepName("Compliance & Security Audit")
                .stepKey("IT_SECURITY_AUDIT")
                .stepOrder(3)
                .requiredRole(Role.ROLE_AUDITOR)
                .stepType(WorkflowStep.StepType.APPROVAL)
                .timeoutHours(12)
                .initialStep(false)
                .terminalStep(false)
                .description("Security auditor inspects SOC2 / ISO compliance.")
                .build();

        WorkflowStep itStep4 = WorkflowStep.builder()
                .workflowDefinition(itDef)
                .stepName("SysAdmin Credentials Provisioned")
                .stepKey("IT_PROVISIONED")
                .stepOrder(4)
                .requiredRole(Role.ROLE_ADMIN)
                .stepType(WorkflowStep.StepType.COMPLETION)
                .timeoutHours(0)
                .initialStep(false)
                .terminalStep(true)
                .description("MFA tokens and keys provisioned securely.")
                .build();

        itDef.getSteps().addAll(List.of(itStep1, itStep2, itStep3, itStep4));
        WorkflowDefinition savedItDef = workflowDefinitionRepository.save(itDef);

        // WF 3: Paid Time Off / Leave
        WorkflowDefinition leaveDef = WorkflowDefinition.builder()
                .name("Annual Leave & Sabbatical Request")
                .code("LEAVE_REQUEST")
                .description("Standard employee paid time off and medical leave booking with automated coverage routing.")
                .department("Human Resources")
                .version(1)
                .status(WorkflowDefinition.Status.ACTIVE)
                .slaHours(72)
                .formSchemaJson("{\"fields\":[{\"name\":\"leaveType\",\"type\":\"select\",\"options\":[\"Annual Leave\",\"Medical Leave\",\"Bereavement\",\"Unpaid Sabbatical\"]},{\"name\":\"startDate\",\"type\":\"date\",\"label\":\"Start Date\"},{\"name\":\"days\",\"type\":\"number\",\"label\":\"Total Business Days\"}]}")
                .steps(new ArrayList<>())
                .build();

        WorkflowStep lStep1 = WorkflowStep.builder()
                .workflowDefinition(leaveDef)
                .stepName("Submit Leave Schedule")
                .stepKey("LEAVE_SUBMIT")
                .stepOrder(1)
                .requiredRole(Role.ROLE_EMPLOYEE)
                .stepType(WorkflowStep.StepType.SUBMISSION)
                .timeoutHours(24)
                .initialStep(true)
                .terminalStep(false)
                .description("Employee specifies dates and emergency coverage deputy.")
                .build();

        WorkflowStep lStep2 = WorkflowStep.builder()
                .workflowDefinition(leaveDef)
                .stepName("Department Head Approval")
                .stepKey("LEAVE_MGR_APPROVAL")
                .stepOrder(2)
                .requiredRole(Role.ROLE_MANAGER)
                .stepType(WorkflowStep.StepType.APPROVAL)
                .timeoutHours(48)
                .initialStep(false)
                .terminalStep(false)
                .description("Manager approves project coverage and resource handover.")
                .build();

        WorkflowStep lStep3 = WorkflowStep.builder()
                .workflowDefinition(leaveDef)
                .stepName("HR Calendar Recorded")
                .stepKey("LEAVE_HR_CONFIRMED")
                .stepOrder(3)
                .requiredRole(Role.ROLE_ADMIN)
                .stepType(WorkflowStep.StepType.COMPLETION)
                .timeoutHours(0)
                .initialStep(false)
                .terminalStep(true)
                .description("Leave balance adjusted and calendar synced.")
                .build();

        leaveDef.getSteps().addAll(List.of(lStep1, lStep2, lStep3));
        WorkflowDefinition savedLeaveDef = workflowDefinitionRepository.save(leaveDef);

        // 3. Seed Realistic Workflow Instances
        // Instance 1: AWS Production Access Request (Waiting on Auditor)
        WorkflowInstance inst1 = WorkflowInstance.builder()
                .trackingNumber("WF-IT-2026-1042")
                .workflowDefinition(savedItDef)
                .title("Elevated Bastion SSH Access for Production Hotfix Deploy")
                .priority(WorkflowInstance.Priority.HIGH)
                .currentStep(savedItDef.getSteps().get(2)) // Compliance & Security Audit
                .initiator(employee)
                .assignee(auditor)
                .status(WorkflowInstance.InstanceStatus.WAITING_APPROVAL)
                .payloadJson("{\"system\":\"AWS Production\",\"durationDays\":3,\"ticketRef\":\"INC-9821 Hotfix Deployment\"}")
                .slaDeadline(LocalDateTime.now().plusHours(18))
                .build();
        WorkflowInstance savedInst1 = workflowInstanceRepository.save(inst1);

        auditLogRepository.save(WorkflowAuditLog.builder()
                .instance(savedInst1)
                .stepName("Access Request Submission")
                .actionTaken("SUBMITTED")
                .actor(employee)
                .previousStatus("NEW")
                .newStatus("IN_PROGRESS")
                .comments("Requested emergency 3-day access for patch release.")
                .durationMinutes(0L)
                .build());

        auditLogRepository.save(WorkflowAuditLog.builder()
                .instance(savedInst1)
                .stepName("Team Lead Verification")
                .actionTaken("APPROVE")
                .actor(manager)
                .previousStatus("IN_PROGRESS")
                .newStatus("WAITING_APPROVAL")
                .comments("Verified ticket requirement. Forwarded to compliance team.")
                .durationMinutes(35L)
                .build());

        // Instance 2: Dell Precision Workstation Expense (Waiting on Manager)
        WorkflowInstance inst2 = WorkflowInstance.builder()
                .trackingNumber("WF-EXP-2026-3190")
                .workflowDefinition(savedExpDef)
                .title("High-Performance Workstation Hardware Reimbursement")
                .priority(WorkflowInstance.Priority.MEDIUM)
                .currentStep(savedExpDef.getSteps().get(1)) // Line Manager Review
                .initiator(employee)
                .assignee(manager)
                .status(WorkflowInstance.InstanceStatus.WAITING_APPROVAL)
                .payloadJson("{\"amount\":2450.00,\"category\":\"Hardware\",\"purpose\":\"Approved upgrade for AI / Local LLM acceleration workstation\"}")
                .slaDeadline(LocalDateTime.now().plusHours(36))
                .build();
        WorkflowInstance savedInst2 = workflowInstanceRepository.save(inst2);

        auditLogRepository.save(WorkflowAuditLog.builder()
                .instance(savedInst2)
                .stepName("Submit Expense Report")
                .actionTaken("SUBMITTED")
                .actor(employee)
                .previousStatus("NEW")
                .newStatus("WAITING_APPROVAL")
                .comments("Invoice PDF attached with department pre-approval memo.")
                .durationMinutes(0L)
                .build());

        // Instance 3: Q4 Conference Travel (Approved)
        WorkflowInstance inst3 = WorkflowInstance.builder()
                .trackingNumber("WF-EXP-2026-0814")
                .workflowDefinition(savedExpDef)
                .title("TechSummit 2026 Speaker Travel & Lodging")
                .priority(WorkflowInstance.Priority.LOW)
                .currentStep(savedExpDef.getSteps().get(3)) // Completed
                .initiator(employee)
                .assignee(finance)
                .status(WorkflowInstance.InstanceStatus.APPROVED)
                .completedAt(LocalDateTime.now().minusHours(4))
                .payloadJson("{\"amount\":1280.50,\"category\":\"Travel\",\"purpose\":\"Keynote presentation on Enterprise Workflow Automation at TechSummit\"}")
                .slaDeadline(LocalDateTime.now().plusHours(24))
                .build();
        WorkflowInstance savedInst3 = workflowInstanceRepository.save(inst3);

        auditLogRepository.save(WorkflowAuditLog.builder()
                .instance(savedInst3)
                .stepName("Line Manager Review")
                .actionTaken("APPROVE")
                .actor(manager)
                .previousStatus("IN_PROGRESS")
                .newStatus("WAITING_APPROVAL")
                .comments("Speaker travel verified against Q4 travel budget.")
                .durationMinutes(120L)
                .build());

        auditLogRepository.save(WorkflowAuditLog.builder()
                .instance(savedInst3)
                .stepName("Finance Disbursal Approval")
                .actionTaken("APPROVE")
                .actor(finance)
                .previousStatus("WAITING_APPROVAL")
                .newStatus("APPROVED")
                .comments("Receipts audited. Disbursal scheduled in payroll batch.")
                .durationMinutes(90L)
                .build());

        log.info("Enterprise workflow seed data created successfully!");
    }
}

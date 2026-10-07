package com.enterprise.workflow.dto.response;

import com.enterprise.workflow.entity.WorkflowInstance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowInstanceResponse {
    private Long id;
    private String trackingNumber;
    private Long workflowDefinitionId;
    private String workflowName;
    private String workflowCode;
    private String title;
    private WorkflowInstance.Priority priority;
    private WorkflowStepResponse currentStep;
    private UserSummaryResponse initiator;
    private UserSummaryResponse assignee;
    private WorkflowInstance.InstanceStatus status;
    private String payloadJson;
    private LocalDateTime slaDeadline;
    private LocalDateTime completedAt;
    private boolean slaBreached;
    private List<String> availableActions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

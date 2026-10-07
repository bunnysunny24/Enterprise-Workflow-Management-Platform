package com.enterprise.workflow.dto.request;

import com.enterprise.workflow.entity.WorkflowInstance;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowInstanceCreateRequest {
    @NotNull(message = "Workflow definition ID is required")
    private Long workflowDefinitionId;

    @NotBlank(message = "Instance title is required")
    private String title;

    private WorkflowInstance.Priority priority = WorkflowInstance.Priority.MEDIUM;

    private String payloadJson; // structured business inputs as JSON string
}

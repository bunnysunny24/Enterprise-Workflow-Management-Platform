package com.enterprise.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkflowActionRequest {
    @NotBlank(message = "Action is required")
    private String action; // e.g. APPROVE, REJECT, REQUEST_CHANGES, ESCALATE, COMMENT

    private String comments;

    private Long nextAssigneeId; // optional override for specific assignee
}

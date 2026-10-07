package com.enterprise.workflow.dto.request;

import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.entity.WorkflowStep;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowStepRequest {
    @NotBlank(message = "Step name is required")
    private String stepName;

    @NotBlank(message = "Step key is required")
    private String stepKey;

    @NotNull(message = "Step order is required")
    private Integer stepOrder;

    private Role requiredRole;
    private WorkflowStep.StepType stepType;
    private Integer timeoutHours = 24;
    private boolean initialStep = false;
    private boolean terminalStep = false;
    private String description;
}

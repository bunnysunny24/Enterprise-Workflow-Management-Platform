package com.enterprise.workflow.dto.response;

import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.entity.WorkflowStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepResponse {
    private Long id;
    private String stepName;
    private String stepKey;
    private Integer stepOrder;
    private Role requiredRole;
    private WorkflowStep.StepType stepType;
    private Integer timeoutHours;
    private boolean initialStep;
    private boolean terminalStep;
    private String description;
}

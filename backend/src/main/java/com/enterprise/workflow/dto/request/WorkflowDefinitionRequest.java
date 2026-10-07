package com.enterprise.workflow.dto.request;

import com.enterprise.workflow.entity.WorkflowDefinition;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class WorkflowDefinitionRequest {
    @NotBlank(message = "Workflow name is required")
    private String name;

    @NotBlank(message = "Workflow code is required")
    private String code;

    private String description;
    private String department;
    private Integer slaHours = 48;
    private WorkflowDefinition.Status status = WorkflowDefinition.Status.ACTIVE;
    private String formSchemaJson;
    private List<WorkflowStepRequest> steps;
}

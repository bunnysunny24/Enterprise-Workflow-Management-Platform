package com.enterprise.workflow.dto.response;

import com.enterprise.workflow.entity.WorkflowDefinition;
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
public class WorkflowDefinitionResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String department;
    private Integer version;
    private WorkflowDefinition.Status status;
    private Integer slaHours;
    private String formSchemaJson;
    private List<WorkflowStepResponse> steps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.enterprise.workflow.repository;

import com.enterprise.workflow.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, Long> {
    List<WorkflowStep> findByWorkflowDefinitionIdOrderByStepOrderAsc(Long workflowDefinitionId);
    Optional<WorkflowStep> findByWorkflowDefinitionIdAndInitialStepTrue(Long workflowDefinitionId);
    Optional<WorkflowStep> findByWorkflowDefinitionIdAndStepKey(Long workflowDefinitionId, String stepKey);
}

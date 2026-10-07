package com.enterprise.workflow.repository;

import com.enterprise.workflow.entity.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, Long> {
    List<WorkflowTransition> findByWorkflowDefinitionId(Long workflowDefinitionId);
    List<WorkflowTransition> findByFromStepId(Long fromStepId);
    Optional<WorkflowTransition> findByFromStepIdAndActionName(Long fromStepId, String actionName);
}

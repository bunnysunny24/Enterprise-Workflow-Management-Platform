package com.enterprise.workflow.repository;

import com.enterprise.workflow.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, Long> {
    Optional<WorkflowDefinition> findByCode(String code);
    Boolean existsByCode(String code);
    List<WorkflowDefinition> findByStatus(WorkflowDefinition.Status status);
    List<WorkflowDefinition> findByDepartment(String department);
}

package com.enterprise.workflow.repository;

import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.entity.WorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, Long> {
    Optional<WorkflowInstance> findByTrackingNumber(String trackingNumber);

    List<WorkflowInstance> findByInitiatorIdOrderByCreatedAtDesc(Long initiatorId);

    List<WorkflowInstance> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);

    @Query("SELECT wi FROM WorkflowInstance wi WHERE wi.currentStep.requiredRole IN :roles AND wi.status IN ('PENDING', 'IN_PROGRESS', 'WAITING_APPROVAL') ORDER BY wi.createdAt DESC")
    List<WorkflowInstance> findPendingByRoles(@Param("roles") List<Role> roles);

    @Query("SELECT wi FROM WorkflowInstance wi WHERE (wi.assignee.id = :userId OR (wi.currentStep.requiredRole IN :roles AND wi.assignee IS NULL)) AND wi.status IN ('PENDING', 'IN_PROGRESS', 'WAITING_APPROVAL') ORDER BY wi.createdAt DESC")
    List<WorkflowInstance> findActionableForUser(@Param("userId") Long userId, @Param("roles") List<Role> roles);

    List<WorkflowInstance> findByWorkflowDefinitionId(Long workflowDefinitionId);

    @Query("SELECT wi.status, COUNT(wi) FROM WorkflowInstance wi GROUP BY wi.status")
    List<Object[]> countByStatusGroup();

    @Query("SELECT wi.workflowDefinition.name, COUNT(wi) FROM WorkflowInstance wi GROUP BY wi.workflowDefinition.name")
    List<Object[]> countByWorkflowDefinitionGroup();

    @Query("SELECT wi.priority, COUNT(wi) FROM WorkflowInstance wi GROUP BY wi.priority")
    List<Object[]> countByPriorityGroup();
}

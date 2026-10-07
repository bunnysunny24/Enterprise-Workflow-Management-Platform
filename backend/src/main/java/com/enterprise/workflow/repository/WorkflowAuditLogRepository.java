package com.enterprise.workflow.repository;

import com.enterprise.workflow.entity.WorkflowAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowAuditLogRepository extends JpaRepository<WorkflowAuditLog, Long> {
    List<WorkflowAuditLog> findByInstanceIdOrderByTimestampAsc(Long instanceId);
    List<WorkflowAuditLog> findTop50ByOrderByTimestampDesc();
    List<WorkflowAuditLog> findByActorIdOrderByTimestampDesc(Long actorId);
}

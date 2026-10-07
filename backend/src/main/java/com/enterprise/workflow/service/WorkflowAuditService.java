package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.response.WorkflowAuditLogResponse;
import com.enterprise.workflow.entity.WorkflowAuditLog;
import com.enterprise.workflow.repository.WorkflowAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowAuditService {

    private final WorkflowAuditLogRepository auditLogRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<WorkflowAuditLogResponse> getLogsForInstance(Long instanceId) {
        return auditLogRepository.findByInstanceIdOrderByTimestampAsc(instanceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowAuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public WorkflowAuditLogResponse mapToResponse(WorkflowAuditLog log) {
        return WorkflowAuditLogResponse.builder()
                .id(log.getId())
                .instanceId(log.getInstance() != null ? log.getInstance().getId() : null)
                .trackingNumber(log.getInstance() != null ? log.getInstance().getTrackingNumber() : null)
                .stepName(log.getStepName())
                .actionTaken(log.getActionTaken())
                .actor(log.getActor() != null ? authService.mapToSummary(log.getActor()) : null)
                .previousStatus(log.getPreviousStatus())
                .newStatus(log.getNewStatus())
                .comments(log.getComments())
                .durationMinutes(log.getDurationMinutes())
                .timestamp(log.getTimestamp())
                .build();
    }
}

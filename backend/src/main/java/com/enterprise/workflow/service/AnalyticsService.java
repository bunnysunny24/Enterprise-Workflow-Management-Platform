package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.response.WorkflowMetricsResponse;
import com.enterprise.workflow.entity.WorkflowInstance;
import com.enterprise.workflow.repository.WorkflowInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final WorkflowInstanceRepository instanceRepository;

    @Transactional(readOnly = true)
    public WorkflowMetricsResponse getWorkflowMetrics() {
        List<WorkflowInstance> allInstances = instanceRepository.findAll();

        long total = allInstances.size();
        long active = 0;
        long approved = 0;
        long rejected = 0;
        long cancelled = 0;
        long slaBreached = 0;
        long totalCompletedHours = 0;
        long completedCount = 0;

        Map<String, Long> byStatus = new LinkedHashMap<>();
        Map<String, Long> byWorkflow = new LinkedHashMap<>();
        Map<String, Long> byPriority = new LinkedHashMap<>();

        LocalDateTime now = LocalDateTime.now();

        for (WorkflowInstance instance : allInstances) {
            String status = instance.getStatus().name();
            byStatus.put(status, byStatus.getOrDefault(status, 0L) + 1L);

            String wfName = instance.getWorkflowDefinition().getName();
            byWorkflow.put(wfName, byWorkflow.getOrDefault(wfName, 0L) + 1L);

            String priority = instance.getPriority().name();
            byPriority.put(priority, byPriority.getOrDefault(priority, 0L) + 1L);

            if (instance.getStatus() == WorkflowInstance.InstanceStatus.APPROVED) {
                approved++;
            } else if (instance.getStatus() == WorkflowInstance.InstanceStatus.REJECTED) {
                rejected++;
            } else if (instance.getStatus() == WorkflowInstance.InstanceStatus.CANCELLED) {
                cancelled++;
            } else {
                active++;
            }

            // SLA check
            if (instance.getSlaDeadline() != null &&
                    now.isAfter(instance.getSlaDeadline()) &&
                    instance.getStatus() != WorkflowInstance.InstanceStatus.APPROVED &&
                    instance.getStatus() != WorkflowInstance.InstanceStatus.REJECTED &&
                    instance.getStatus() != WorkflowInstance.InstanceStatus.CANCELLED) {
                slaBreached++;
            }

            // Turnaround duration for completed
            if (instance.getCompletedAt() != null && instance.getCreatedAt() != null) {
                long hours = Duration.between(instance.getCreatedAt(), instance.getCompletedAt()).toHours();
                totalCompletedHours += Math.max(1, hours);
                completedCount++;
            }
        }

        double avgHours = completedCount > 0 ? (double) totalCompletedHours / completedCount : 0.0;

        return WorkflowMetricsResponse.builder()
                .totalInstances(total)
                .activeInstances(active)
                .approvedInstances(approved)
                .rejectedInstances(rejected)
                .cancelledInstances(cancelled)
                .slaBreachedInstances(slaBreached)
                .avgCompletionHours(Math.round(avgHours * 10.0) / 10.0)
                .instancesByStatus(byStatus)
                .instancesByWorkflow(byWorkflow)
                .instancesByPriority(byPriority)
                .build();
    }
}

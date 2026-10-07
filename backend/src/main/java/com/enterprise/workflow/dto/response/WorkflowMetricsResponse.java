package com.enterprise.workflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowMetricsResponse {
    private long totalInstances;
    private long activeInstances;
    private long approvedInstances;
    private long rejectedInstances;
    private long cancelledInstances;
    private long slaBreachedInstances;
    private double avgCompletionHours;
    private Map<String, Long> instancesByStatus;
    private Map<String, Long> instancesByWorkflow;
    private Map<String, Long> instancesByPriority;
}

package com.enterprise.workflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowAuditLogResponse {
    private Long id;
    private Long instanceId;
    private String trackingNumber;
    private String stepName;
    private String actionTaken;
    private UserSummaryResponse actor;
    private String previousStatus;
    private String newStatus;
    private String comments;
    private Long durationMinutes;
    private LocalDateTime timestamp;
}

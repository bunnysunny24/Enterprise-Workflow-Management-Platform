package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.response.ApiResponse;
import com.enterprise.workflow.dto.response.WorkflowAuditLogResponse;
import com.enterprise.workflow.service.WorkflowAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows/audit")
@RequiredArgsConstructor
public class WorkflowAuditController {

    private final WorkflowAuditService auditService;

    @GetMapping("/instance/{instanceId}")
    public ResponseEntity<ApiResponse<List<WorkflowAuditLogResponse>>> getLogsForInstance(
            @PathVariable Long instanceId) {
        List<WorkflowAuditLogResponse> logs = auditService.getLogsForInstance(instanceId);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<WorkflowAuditLogResponse>>> getRecentAuditLogs() {
        List<WorkflowAuditLogResponse> logs = auditService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}

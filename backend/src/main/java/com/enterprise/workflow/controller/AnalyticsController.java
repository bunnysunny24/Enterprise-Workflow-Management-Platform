package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.response.ApiResponse;
import com.enterprise.workflow.dto.response.WorkflowMetricsResponse;
import com.enterprise.workflow.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workflows/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<WorkflowMetricsResponse>> getMetrics() {
        WorkflowMetricsResponse metrics = analyticsService.getWorkflowMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}

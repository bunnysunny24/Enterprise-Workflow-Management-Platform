package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.request.WorkflowActionRequest;
import com.enterprise.workflow.dto.request.WorkflowInstanceCreateRequest;
import com.enterprise.workflow.dto.response.ApiResponse;
import com.enterprise.workflow.dto.response.WorkflowInstanceResponse;
import com.enterprise.workflow.service.WorkflowInstanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows/instances")
@RequiredArgsConstructor
public class WorkflowInstanceController {

    private final WorkflowInstanceService instanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkflowInstanceResponse>>> getAllInstances() {
        List<WorkflowInstanceResponse> list = instanceService.getAllInstances();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowInstanceResponse>> getInstanceById(@PathVariable Long id) {
        WorkflowInstanceResponse response = instanceService.getInstanceById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkflowInstanceResponse>> createInstance(
            @Valid @RequestBody WorkflowInstanceCreateRequest request) {
        WorkflowInstanceResponse response = instanceService.createInstance(request);
        return new ResponseEntity<>(ApiResponse.ok("Workflow instance initiated successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<ApiResponse<WorkflowInstanceResponse>> executeAction(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowActionRequest actionRequest) {
        WorkflowInstanceResponse response = instanceService.executeAction(id, actionRequest);
        return ResponseEntity.ok(ApiResponse.ok("Workflow action applied successfully", response));
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<List<WorkflowInstanceResponse>>> getMySubmissions() {
        List<WorkflowInstanceResponse> list = instanceService.getMySubmissions();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<ApiResponse<List<WorkflowInstanceResponse>>> getPendingApprovals() {
        List<WorkflowInstanceResponse> list = instanceService.getActionablePendingForCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

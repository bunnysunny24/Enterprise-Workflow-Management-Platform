package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.request.WorkflowDefinitionRequest;
import com.enterprise.workflow.dto.response.ApiResponse;
import com.enterprise.workflow.dto.response.WorkflowDefinitionResponse;
import com.enterprise.workflow.service.WorkflowDefinitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows/definitions")
@RequiredArgsConstructor
public class WorkflowDefinitionController {

    private final WorkflowDefinitionService definitionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkflowDefinitionResponse>>> getAllDefinitions() {
        List<WorkflowDefinitionResponse> definitions = definitionService.getAllDefinitions();
        return ResponseEntity.ok(ApiResponse.ok(definitions));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<WorkflowDefinitionResponse>>> getActiveDefinitions() {
        List<WorkflowDefinitionResponse> definitions = definitionService.getActiveDefinitions();
        return ResponseEntity.ok(ApiResponse.ok(definitions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> getDefinitionById(@PathVariable Long id) {
        WorkflowDefinitionResponse definition = definitionService.getDefinitionById(id);
        return ResponseEntity.ok(ApiResponse.ok(definition));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> createDefinition(
            @Valid @RequestBody WorkflowDefinitionRequest request) {
        WorkflowDefinitionResponse response = definitionService.createDefinition(request);
        return new ResponseEntity<>(ApiResponse.ok("Workflow definition created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkflowDefinitionResponse>> updateDefinition(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowDefinitionRequest request) {
        WorkflowDefinitionResponse response = definitionService.updateDefinition(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Workflow definition updated successfully", response));
    }
}

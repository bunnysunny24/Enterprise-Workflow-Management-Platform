package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.response.ApiResponse;
import com.enterprise.workflow.dto.response.UserSummaryResponse;
import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getAllUsers(
            @RequestParam(required = false) Role role) {
        List<UserSummaryResponse> users;
        if (role != null) {
            users = userService.getUsersByRole(role);
        } else {
            users = userService.getAllUsers();
        }
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUserById(@PathVariable Long id) {
        UserSummaryResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}

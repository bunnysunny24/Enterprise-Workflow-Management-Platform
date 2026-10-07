package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.request.LoginRequest;
import com.enterprise.workflow.dto.request.RegisterRequest;
import com.enterprise.workflow.dto.response.ApiResponse;
import com.enterprise.workflow.dto.response.AuthResponse;
import com.enterprise.workflow.dto.response.UserSummaryResponse;
import com.enterprise.workflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser() {
        UserSummaryResponse response = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}

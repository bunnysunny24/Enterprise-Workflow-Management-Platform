package com.enterprise.workflow.service;

import com.enterprise.workflow.dto.response.UserSummaryResponse;
import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.exception.ResourceNotFoundException;
import com.enterprise.workflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::mapToSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return authService.mapToSummary(user);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(authService::mapToSummary)
                .collect(Collectors.toList());
    }
}

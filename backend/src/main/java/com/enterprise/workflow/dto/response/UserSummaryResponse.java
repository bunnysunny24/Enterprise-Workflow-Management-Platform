package com.enterprise.workflow.dto.response;

import com.enterprise.workflow.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String jobTitle;
    private Set<Role> roles;
    private boolean active;
}

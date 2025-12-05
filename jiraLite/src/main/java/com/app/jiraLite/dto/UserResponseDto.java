package com.app.jiraLite.dto;

import java.util.Set;
import java.util.stream.Collectors;

import com.app.jiraLite.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private String fullName;

    public static UserResponseDto fromEntity(User u) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setFullName(null); // set if User has fullName field
        if (u.getRoles() != null) {
            dto.setRoles(u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()));
        }
        return dto;
    }
}
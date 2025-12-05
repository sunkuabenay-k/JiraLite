package com.app.jiraLite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Role name cannot be blank")
    private String roleName; // e.g. "ADMIN", "DEVELOPER", "QA"
}

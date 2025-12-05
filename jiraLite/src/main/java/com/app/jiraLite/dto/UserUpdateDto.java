package com.app.jiraLite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters")
    private String fullName;

    // optional: allow username update
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    /**
     * Helper to patch an entity from non-null fields.
     */
    public void applyTo(com.app.jiraLite.entity.User user) {
        if (email != null) user.setEmail(email);
        if (username != null) user.setUsername(username);
    }
}

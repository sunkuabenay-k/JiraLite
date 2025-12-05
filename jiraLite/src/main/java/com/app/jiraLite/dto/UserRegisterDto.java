package com.app.jiraLite.dto;

import com.app.jiraLite.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterDto {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String fullName;

    public User toEntity() {
        User u = new User();
        u.setUsername(this.username);
        u.setEmail(this.email);
        u.setPassword(this.password); // ensure service encodes password
        return u;
    }
}

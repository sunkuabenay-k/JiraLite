package com.app.jiraLite.dto;

import com.app.jiraLite.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String username;
    private String email;

    public static UserSummaryDto fromEntity(User u) {
        if (u == null) return null;
        UserSummaryDto s = new UserSummaryDto();
        s.setId(u.getId());
        s.setUsername(u.getUsername());
        s.setEmail(u.getEmail());
        return s;
    }
}

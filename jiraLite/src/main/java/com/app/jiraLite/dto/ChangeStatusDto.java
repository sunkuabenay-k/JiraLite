package com.app.jiraLite.dto;

import com.app.jiraLite.enumType.IssueStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeStatusDto {
    @NotNull
    private IssueStatus targetStatus;
    private String comment;
}

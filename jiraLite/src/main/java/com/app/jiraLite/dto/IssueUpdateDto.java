package com.app.jiraLite.dto;

import com.app.jiraLite.entity.Issue;
import com.app.jiraLite.enumType.IssuePriority;
import com.app.jiraLite.enumType.IssueSeverity;
import com.app.jiraLite.enumType.IssueType;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data 
@NoArgsConstructor
@AllArgsConstructor
public class IssueUpdateDto {
    private String title;
    private String description;
    private IssuePriority priority;
    private IssueSeverity severity;
    private IssueType type;
    private Long assigneeId;
    // mapping helper to patch an issue - service should apply non-null fields
    public void applyTo(Issue issue) {
        if (title != null) issue.setTitle(title);
        if (description != null) issue.setDescription(description);
        if (priority != null) issue.setPriority(priority);
        if (severity != null) issue.setSeverity(severity);
        if (type != null) issue.setType(type);
    }
}
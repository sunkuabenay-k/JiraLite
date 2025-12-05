package com.app.jiraLite.dto;

import java.time.LocalDateTime;

import com.app.jiraLite.entity.Issue;
import com.app.jiraLite.entity.User;
import com.app.jiraLite.enumType.IssuePriority;
import com.app.jiraLite.enumType.IssueSeverity;
import com.app.jiraLite.enumType.IssueStatus;
import com.app.jiraLite.enumType.IssueType;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueCreateDto {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private IssuePriority priority;

    private IssueSeverity severity;

    @NotNull
    private IssueType type;

    // Optional: assign on create
    private Long assigneeId;

    // If reporter omitted, service can use current user
    private Long reporterId;

    /**
     * Convert DTO -> partial Issue entity.
     * Note: This does not set relations (reporter/assignee) if null;
     * pass the resolved User objects to toIssue(User reporter, User assignee).
     */
    public Issue toIssue() {
        Issue issue = new Issue();
        issue.setTitle(this.title);
        issue.setDescription(this.description);
        issue.setPriority(this.priority);
        issue.setSeverity(this.severity);
        issue.setType(this.type);
        issue.setStatus(IssueStatus.OPEN); // default on create
        issue.setCreatedAt(LocalDateTime.now());
        issue.setUpdatedAt(LocalDateTime.now());
        return issue;
    }

    /**
     * Convert DTO -> Issue and set reporter/assignee if provided.
     */
    public Issue toIssue(User reporter, User assignee) {
        Issue issue = toIssue();
        issue.setReporter(reporter);
        issue.setAssignee(assignee);
        return issue;
    }
}

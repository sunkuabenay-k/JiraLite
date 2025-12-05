package com.app.jiraLite.dto;

import java.time.LocalDateTime;

import com.app.jiraLite.entity.Issue;
import com.app.jiraLite.enumType.IssuePriority;
import com.app.jiraLite.enumType.IssueSeverity;
import com.app.jiraLite.enumType.IssueStatus;
import com.app.jiraLite.enumType.IssueType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueResponseDto {
    private Long id;
    private String title;
    private String description;
    private IssueStatus status;
    private IssuePriority priority;
    private IssueSeverity severity;
    private IssueType type;
    private UserSummaryDto reporter;
    private UserSummaryDto assignee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int commentCount;
    private int watcherCount;

    public static IssueResponseDto fromEntity(Issue issue) {
        IssueResponseDto dto = new IssueResponseDto();
        dto.setId(issue.getId());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setStatus(issue.getStatus());
        dto.setPriority(issue.getPriority());
        dto.setSeverity(issue.getSeverity());
        dto.setType(issue.getType());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        dto.setCommentCount(issue.getComments() == null ? 0 : issue.getComments().size());
        dto.setWatcherCount(issue.getWatchers() == null ? 0 : issue.getWatchers().size());
        if (issue.getReporter() != null) dto.setReporter(UserSummaryDto.fromEntity(issue.getReporter()));
        if (issue.getAssignee() != null) dto.setAssignee(UserSummaryDto.fromEntity(issue.getAssignee()));
        return dto;
    }
}
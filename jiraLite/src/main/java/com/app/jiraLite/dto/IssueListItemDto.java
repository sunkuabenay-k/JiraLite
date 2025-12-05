package com.app.jiraLite.dto;

import java.time.LocalDateTime;

import com.app.jiraLite.enumType.IssuePriority;
import com.app.jiraLite.enumType.IssueStatus;
import com.app.jiraLite.enumType.IssueSeverity;
import com.app.jiraLite.enumType.IssueType;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueListItemDto {
    private Long id;
    private String title;
    private IssueStatus status;
    private IssuePriority priority;
    private IssueSeverity severity;     // ✅ NEW
    private IssueType type;             // ✅ NEW
    private UserSummaryDto assignee;
    private UserSummaryDto reporter;    // ✅ NEW
    private LocalDateTime createdAt;
}

// IssueSearchCriteriaDto: single place for search/filter params
package com.app.jiraLite.dto;
import java.time.LocalDateTime;
import lombok.*;
import com.app.jiraLite.enumType.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueSearchCriteriaDto {
	private Long issue_id;
	private String title;
    private IssueStatus status;
    private IssuePriority priority;
    private IssueSeverity severity;
    private IssueType type;
    private Long assigneeId;
    private Long reporterId;
    private LocalDateTime createdFrom;
    private LocalDateTime createdTo;

}

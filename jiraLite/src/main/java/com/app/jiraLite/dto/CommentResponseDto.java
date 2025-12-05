package com.app.jiraLite.dto;

import java.time.LocalDateTime;

import com.app.jiraLite.entity.Comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {
    private Long id;
    private Long issueId;
    private UserSummaryDto author;
    private String text;
    private LocalDateTime createdAt;

    public static CommentResponseDto fromEntity(Comment c) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(c.getId());
        dto.setIssueId(c.getIssue() != null ? c.getIssue().getId() : null);
        dto.setAuthor(c.getAuthor() != null ? UserSummaryDto.fromEntity(c.getAuthor()) : null);
        dto.setText(c.getText());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}

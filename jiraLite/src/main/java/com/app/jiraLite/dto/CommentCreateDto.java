package com.app.jiraLite.dto;

import java.time.LocalDateTime;

import com.app.jiraLite.entity.Comment;
import com.app.jiraLite.entity.Issue;
import com.app.jiraLite.entity.User;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreateDto {
    @NotBlank
    private String text;
    @NotNull
    private Long authorId;

    public Comment toEntity(Issue issue, User author) {
        Comment c = new Comment();
        c.setIssue(issue);
        c.setAuthor(author);
        c.setText(this.text);
        c.setCreatedAt(LocalDateTime.now());
        return c;
    }
}

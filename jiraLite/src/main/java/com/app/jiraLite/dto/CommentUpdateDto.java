// CommentUpdateDto: used for PATCH/PUT comment updates
package com.app.jiraLite.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentUpdateDto {
    @NotBlank
    private String text;
}

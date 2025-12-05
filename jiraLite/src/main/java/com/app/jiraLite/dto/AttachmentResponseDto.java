// AttachmentResponseDto: metadata for attachments (do NOT include raw file)
package com.app.jiraLite.dto;
import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponseDto {
    private Long id;
    private String filename;
    private String contentType;   // "image/png" etc.
    private Long sizeBytes;
    private String storageUrl;    // signed URL or internal path (be careful exposing)
    private UserSummaryDto uploadedBy;
    private LocalDateTime uploadedAt;
}

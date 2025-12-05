package com.app.jiraLite.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attachments")
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // link to the issue (many attachments can belong to one issue)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Column(nullable = false)
    private String filename;

    // MIME type like "image/png" or "application/pdf"
    @Column(name = "content_type", nullable = false)
    private String contentType;

    // optional: file size in bytes
    @Column(name = "size_bytes")
    private Long sizeBytes;

    // where the actual file is stored (S3 URL, or path on disk, etc.)
    @Column(name = "storage_url", nullable = false)
    private String storageUrl;

    // who uploaded it - link to User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    // when it was uploaded
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
}

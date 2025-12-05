package com.app.jiraLite.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"issue", "author"}) // Exclude relationships
@EqualsAndHashCode(exclude = {"issue", "author"}) // Exclude relationships
@Table(name = "comments")
public class Comment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
    // Relationship: Many Comments belong to One Issue (Many-to-One)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "issue_id", nullable = false)
	private Issue issue;
	
    // Relationship: Many Comments belong to One Author (Many-to-One)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "author_id", nullable = false)
	private User author;
	
	@Column(columnDefinition = "TEXT", nullable = false)
	private String text;
	
    // Corrected to camelCase; initialized on creation
	private LocalDateTime createdAt = LocalDateTime.now();
	
	@Column
	private LocalDateTime updatedAt;

}
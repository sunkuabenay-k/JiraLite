package com.app.jiraLite.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.jiraLite.entity.Issue;
import com.app.jiraLite.enumType.IssuePriority;
import com.app.jiraLite.enumType.IssueSeverity;
import com.app.jiraLite.enumType.IssueStatus;
import com.app.jiraLite.enumType.IssueType;

public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    // Use IssueStatus enum type instead of String
    Page<Issue> findByStatus(IssueStatus status, Pageable pageable);

    // Use IssueStatus enum type instead of String
    long countByStatus(IssueStatus status);
    
    Page<Issue> findByAssigneeId(Long assigneeId, Pageable pageable);

    Page<Issue> findByReporterId(Long reporterId, Pageable pageable);

    Page<Issue> findByPriority(String priority, Pageable pageable);
    
    @Query(
    	    value = """
    	        SELECT i FROM Issue i
    	        WHERE (:issueId IS NULL OR i.id = :issueId)
    	        AND (:title IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :title, '%')))
    	        AND (:status IS NULL OR i.status = :status)
    	        AND (:priority IS NULL OR i.priority = :priority)
    	        AND (:severity IS NULL OR i.severity = :severity)
    	        AND (:type IS NULL OR i.type = :type)
    	        AND (:assigneeId IS NULL OR i.assignee.id = :assigneeId)
    	        AND (:reporterId IS NULL OR i.reporter.id = :reporterId)
    	        AND (:createdFrom IS NULL OR i.createdAt >= :createdFrom)
    	        AND (:createdTo IS NULL OR i.createdAt <= :createdTo)
    	    """,
    	    countQuery = """
    	        SELECT COUNT(i) FROM Issue i
    	        WHERE (:issueId IS NULL OR i.id = :issueId)
    	        AND (:title IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :title, '%')))
    	        AND (:status IS NULL OR i.status = :status)
    	        AND (:priority IS NULL OR i.priority = :priority)
    	        AND (:severity IS NULL OR i.severity = :severity)
    	        AND (:type IS NULL OR i.type = :type)
    	        AND (:assigneeId IS NULL OR i.assignee.id = :assigneeId)
    	        AND (:reporterId IS NULL OR i.reporter.id = :reporterId)
    	        AND (:createdFrom IS NULL OR i.createdAt >= :createdFrom)
    	        AND (:createdTo IS NULL OR i.createdAt <= :createdTo)
    	    """
    	)
    	Page<Issue> search(
    	        @Param("issueId") Long issueId,
    	        @Param("title") String title,
    	        @Param("status") IssueStatus status,
    	        @Param("priority") IssuePriority priority,
    	        @Param("severity") IssueSeverity severity,
    	        @Param("type") IssueType type,
    	        @Param("assigneeId") Long assigneeId,
    	        @Param("reporterId") Long reporterId,
    	        @Param("createdFrom") LocalDateTime createdFrom,
    	        @Param("createdTo") LocalDateTime createdTo,
    	        Pageable pageable
    	);



}

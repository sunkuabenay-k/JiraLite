package com.app.jiraLite.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.jiraLite.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long>{

    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
    Page<Comment> findByIssueId(Long issueId, Pageable pageable);


}

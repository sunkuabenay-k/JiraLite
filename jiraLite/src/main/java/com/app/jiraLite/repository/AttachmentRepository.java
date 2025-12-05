package com.app.jiraLite.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.jiraLite.entity.Attachment;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long>{
	List<Attachment> findByIssueId(Long issueId);

}

package com.app.jiraLite.service.impl;

import com.app.jiraLite.dto.*;
import com.app.jiraLite.entity.*;
import com.app.jiraLite.enumType.IssueStatus;
import com.app.jiraLite.exception.IssueException;
import com.app.jiraLite.repository.*;
import com.app.jiraLite.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    // Helper to get currently logged-in User Entity
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IssueException("User not found in context"));
    }

    // --- 1. VIEW (Allowed for everyone with an account) ---
    @Override
    @Transactional(readOnly = true)
    public IssueResponseDto getIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueException("Issue", "id", issueId));
        return toIssueResponseDto(issue);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueListItemDto> searchIssues(IssueSearchCriteriaDto criteria, Pageable pageable) {
        // Everyone can view all issues
        return issueRepository.search(
                criteria.getIssue_id(),
                criteria.getTitle(),
                criteria.getStatus(),
                criteria.getPriority(),
                criteria.getSeverity(),
                criteria.getType(),
                criteria.getAssigneeId(),
                criteria.getReporterId(),
                criteria.getCreatedFrom(),
                criteria.getCreatedTo(),
                pageable
        ).map(this::toIssueListItemDto);
    }


    // --- 2. CREATE (Allowed for USER role) ---
    @Override
    public IssueResponseDto createIssue(IssueCreateDto dto) {
        User currentUser = getCurrentUser();
        
        Issue entity = new Issue();
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setPriority(dto.getPriority());
        entity.setSeverity(dto.getSeverity()); // Reporter sets severity
        entity.setType(dto.getType());         // Reporter sets type
        entity.setStatus(IssueStatus.OPEN);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setReporter(currentUser);       // AUTO-SET REPORTER

        // Optional: Assign on create
        if (dto.getAssigneeId() != null) {
            User assignee = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new IssueException("User", "id", dto.getAssigneeId()));
            entity.setAssignee(assignee);
        }

        return toIssueResponseDto(issueRepository.save(entity));
    }

    // --- 3. UPDATE (Matrix Logic) ---
    @Override
    public IssueResponseDto updateIssue(Long issueId, IssueUpdateDto dto) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueException("Issue", "id", issueId));
        
        User currentUser = getCurrentUser();
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
        boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));

        // Rule: Only Reporter or Assignee can edit Title/Desc
        if (!isReporter && !isAssignee && !isAdmin) {
            throw new IssueException("Access Denied: Only Reporter or Assignee can edit details.");
        }

        // Rule: Only Reporter can change Severity
        if (dto.getSeverity() != null && !isReporter && !isAdmin) {
            throw new IssueException("Access Denied: Only Reporter can change severity.");
        }

        // Apply updates
        if (dto.getTitle() != null) issue.setTitle(dto.getTitle());
        if (dto.getDescription() != null) issue.setDescription(dto.getDescription());
        if (dto.getPriority() != null) issue.setPriority(dto.getPriority());
        if (dto.getSeverity() != null) issue.setSeverity(dto.getSeverity());
        
        // Type usually cannot be changed after create, or restrict to Reporter
        if (dto.getType() != null && isReporter) issue.setType(dto.getType());

        issue.setUpdatedAt(LocalDateTime.now());
        return toIssueResponseDto(issueRepository.save(issue));
    }

    // --- 4. CHANGE STATUS (Matrix Logic) ---
    @Override
    public IssueResponseDto changeStatus(Long issueId, ChangeStatusDto dto) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueException("Issue", "id", issueId));

        User currentUser = getCurrentUser();
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
        boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());

        // Logic: Assignee has full control. Reporter can only Reopen (CLOSED -> OPEN).
        boolean allowed = false;

        if (isAssignee) {
            allowed = true; // Assignee can move anywhere
        } else if (isReporter) {
            // Reporter can only re-open a closed issue
            if (issue.getStatus() == IssueStatus.CLOSED && dto.getTargetStatus() == IssueStatus.OPEN) {
                allowed = true;
            }
        }

        if (!allowed) {
            throw new IssueException("Access Denied: You cannot change status to " + dto.getTargetStatus());
        }

        issue.setStatus(dto.getTargetStatus());
        issue.setUpdatedAt(LocalDateTime.now());
        return toIssueResponseDto(issueRepository.save(issue));
    }

    // --- 5. COMMENTS ---
    @Override
    public CommentResponseDto addComment(Long issueId, CommentCreateDto dto) {
        // Everyone can comment
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueException("Issue", "id", issueId));
        User author = getCurrentUser();

        Comment comment = new Comment();
        comment.setIssue(issue);
        comment.setAuthor(author);
        comment.setText(dto.getText());
        comment.setCreatedAt(LocalDateTime.now());

        return toCommentResponseDto(commentRepository.save(comment));
    }

    // --- 6. DELETE (Admin Only) ---
    @Override
    public void deleteIssue(Long issueId) {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        
        if (!isAdmin) {
            throw new IssueException("Access Denied: Only Admins can delete issues.");
        }
        issueRepository.deleteById(issueId);
    }

    // --- Helper Methods ---
    private IssueResponseDto toIssueResponseDto(Issue issue) {
        IssueResponseDto dto = IssueResponseDto.fromEntity(issue);
        // Add extra logic if needed
        return dto;
    }
    
    private IssueListItemDto toIssueListItemDto(Issue issue) {
        IssueListItemDto dto = new IssueListItemDto();
        dto.setId(issue.getId());
        dto.setTitle(issue.getTitle());
        dto.setStatus(issue.getStatus());
        dto.setPriority(issue.getPriority());
        dto.setSeverity(issue.getSeverity());      // NEW
        dto.setType(issue.getType());              // NEW
        dto.setCreatedAt(issue.getCreatedAt());

        // Assignee & reporter can be null, so guard them:
        dto.setAssignee(
                issue.getAssignee() != null
                        ? UserSummaryDto.fromEntity(issue.getAssignee())
                        : null
        );

        dto.setReporter(
                issue.getReporter() != null
                        ? UserSummaryDto.fromEntity(issue.getReporter())
                        : null
        );

        return dto;
    }


    private CommentResponseDto toCommentResponseDto(Comment comment) {
        return CommentResponseDto.fromEntity(comment);
    }
    
    @Override
    public IssueResponseDto assignIssue(Long issueId, AssignIssueDto dto) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueException("Issue", "id", issueId));

        User currentUser = getCurrentUser();

        // 1. Prevent reporter from claiming their own issue
        if (issue.getReporter() != null && issue.getReporter().getId().equals(currentUser.getId())) {
            throw new IssueException("You cannot claim an issue you reported.");
        }

        // 2. Decide whom to assign to:
        //    - if dto.assigneeId is provided, use that
        //    - else default to current user (for "Claim Issue" button)
        Long targetAssigneeId = dto.getAssigneeId() != null
                ? dto.getAssigneeId()
                : currentUser.getId();

        User assignee = userRepository.findById(targetAssigneeId)
                .orElseThrow(() -> new IssueException("User", "id", targetAssigneeId));

        // 3. Optional: Only allow claiming if currently unassigned
        if (issue.getAssignee() != null &&
            !issue.getAssignee().getId().equals(assignee.getId())) {
            throw new IssueException("Issue is already assigned to another user.");
        }

        issue.setAssignee(assignee);
        issue.setUpdatedAt(LocalDateTime.now());

        Issue saved = issueRepository.save(issue);
        return toIssueResponseDto(saved);
    }
    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponseDto> getComments(Long issueId, Pageable pageable) {
        // Ensure the issue exists (optional but nicer errors)
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueException("Issue", "id", issueId));

        Page<Comment> comments = commentRepository.findByIssueId(issue.getId(), pageable);

        return comments.map(this::toCommentResponseDto);
    }

    @Override
    public CommentResponseDto updateComment(Long commentId, CommentUpdateDto dto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IssueException("Comment", "id", commentId));

        User currentUser = getCurrentUser();
        boolean isAuthor = comment.getAuthor() != null &&
                           comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream()
                           .anyMatch(r -> r.getName().equals("ADMIN"));

        // Rule: Only author or ADMIN can edit comment
        if (!isAuthor && !isAdmin) {
            throw new IssueException("Access Denied: You cannot edit this comment.");
        }

        if (dto.getText() != null && !dto.getText().isBlank()) {
            comment.setText(dto.getText());
        }

        // If your Comment entity has updatedAt, set it here
        try {
            comment.setUpdatedAt(LocalDateTime.now());
        } catch (Exception e) {
            // If no updatedAt, ignore
        }

        Comment saved = commentRepository.save(comment);
        return toCommentResponseDto(saved);
    }

    @Override
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IssueException("Comment", "id", commentId));

        User currentUser = getCurrentUser();
        boolean isAuthor = comment.getAuthor() != null &&
                           comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream()
                           .anyMatch(r -> r.getName().equals("ADMIN"));

        // Rule: Only author or ADMIN can delete
        if (!isAuthor && !isAdmin) {
            throw new IssueException("Access Denied: You cannot delete this comment.");
        }

        commentRepository.delete(comment);
    }


    // Missing overrides for Watcher/Assign logic... implement similarly using currentUser checks.
    
//    @Override public CommentResponseDto updateComment(Long commentId, CommentUpdateDto dto) { return null; }
//    @Override public void deleteComment(Long commentId) { }
//    @Override public Page<CommentResponseDto> getComments(Long issueId, Pageable pageable) { return null; }
    @Override public void addWatcher(Long issueId, WatcherDto dto) { }
    @Override public void removeWatcher(Long issueId, Long userId) { }
    @Override public Page<UserSummaryDto> getWatchers(Long issueId, Pageable pageable) { return null; }
}
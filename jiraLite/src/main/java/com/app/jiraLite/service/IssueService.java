package com.app.jiraLite.service;

import com.app.jiraLite.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface IssueService {

    // Create / Read / Update / Delete
    IssueResponseDto createIssue(IssueCreateDto dto);                          // createIssue
    IssueResponseDto updateIssue(Long issueId, IssueUpdateDto dto);           // updateIssue
    IssueResponseDto getIssue(Long issueId);                                  // getIssue
    void deleteIssue(Long issueId);                                           // deleteIssue (admin)

    // Status & assignment
    IssueResponseDto changeStatus(Long issueId, ChangeStatusDto dto);         // changeStatus
    IssueResponseDto assignIssue(Long issueId, AssignIssueDto dto);           // assignissue

    // Comments
    CommentResponseDto addComment(Long issueId, CommentCreateDto dto);        // addcomment
    CommentResponseDto updateComment(Long commentId, CommentUpdateDto dto);   // updateComment
    void deleteComment(Long commentId);                                       // deleteComment
    Page<CommentResponseDto> getComments(Long issueId, Pageable pageable);     // getcomments

    // Watchers
    void addWatcher(Long issueId, WatcherDto dto);                            // addwatcher
    void removeWatcher(Long issueId, Long userId);                            // removewatcher
    Page<UserSummaryDto> getWatchers(Long issueId, Pageable pageable);        // getwatchers

    // Attachments
//    AttachmentResponseDto addAttachment(Long issueId, MultipartFile file);    // addAttachment
//    void deleteAttachment(Long attachmentId);                                 // deleteAttachment
//    Page<AttachmentResponseDto> getAttachments(Long issueId, Pageable pageable);

    // Search / List
    Page<IssueListItemDto> searchIssues(IssueSearchCriteriaDto criteria, Pageable pageable); // searchissues

    // Optional helper
//    IssueResponseDto markAsDuplicate(Long issueId, Long originalIssueId);     // optional
}

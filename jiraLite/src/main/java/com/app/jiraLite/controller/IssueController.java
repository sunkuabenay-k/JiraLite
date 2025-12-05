package com.app.jiraLite.controller;

import com.app.jiraLite.dto.*;
import com.app.jiraLite.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Validated
public class IssueController {

    private final IssueService issueService;

    // --- 1. CORE ISSUE CRUD ---

    /**
     * POST /api/issues : Creates a new issue.
     */
    @PostMapping
    public ResponseEntity<IssueResponseDto> createIssue(@Valid @RequestBody IssueCreateDto dto) {
        // NOTE: In a secured app, reporterId in DTO should be ignored;
        // the service layer must use the ID of the currently authenticated user.
    	System.out.println("createIssue: IssueCreateDto to IssueResponseDto");
        IssueResponseDto response = issueService.createIssue(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/issues/{issueId} : Retrieves a single issue by ID.
     */
    @GetMapping("/{issueId}")
    public ResponseEntity<IssueResponseDto> getIssue(@PathVariable Long issueId) {
    	System.out.println("getIssue: issueId to IssueResponseDto");
        IssueResponseDto response = issueService.getIssue(issueId);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/issues/{issueId} : Partially updates an issue (title, description, priority, etc.).
     */
    @PatchMapping("/{issueId}")
    public ResponseEntity<IssueResponseDto> updateIssue(@PathVariable Long issueId, 
                                                        @Valid @RequestBody IssueUpdateDto dto) {
    	System.out.println("updateIssue: issueId and IssueUpdateDto to IssueResponseDto");
        IssueResponseDto response = issueService.updateIssue(issueId, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/issues/{issueId} : Deletes an issue. (Requires ADMIN/high privilege in a secured app).
     */
    @DeleteMapping("/{issueId}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long issueId) {
    	System.out.println("deleteIssue: issueId to Void");
        issueService.deleteIssue(issueId);
        return ResponseEntity.noContent().build();
    }

    // --- 2. LISTING AND SEARCHING ---

    /**
     * GET /api/issues : Searches issues based on criteria or lists all if no criteria provided.
     */
    @GetMapping
    public ResponseEntity<Page<IssueListItemDto>> searchIssues(
            IssueSearchCriteriaDto criteria, // Params are automatically bound from query string
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
    	System.out.println("searchIssues: IssueSearchCriteriaDto and Pageable to Page<IssueListItemDto>");
        
        Page<IssueListItemDto> page = issueService.searchIssues(criteria, pageable);
        return ResponseEntity.ok(page);
    }

    // --- 3. STATUS AND ASSIGNMENT ---

    /**
     * PATCH /api/issues/{issueId}/status : Changes the status of an issue.
     */
    @PatchMapping("/{issueId}/status")
    public ResponseEntity<IssueResponseDto> changeStatus(@PathVariable Long issueId,
                                                        @Valid @RequestBody ChangeStatusDto dto) {
    	System.out.println("changeStatus: issueId and ChangeStatusDto to IssueResponseDto");
        IssueResponseDto response = issueService.changeStatus(issueId, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/issues/{issueId}/assignee : Assigns the issue to a user.
     */
    @PatchMapping("/{issueId}/assignee")
    public ResponseEntity<IssueResponseDto> assignIssue(@PathVariable Long issueId,
                                                       @Valid @RequestBody AssignIssueDto dto) {
    	System.out.println("assignIssue: issueId and AssignIssueDto to IssueResponseDto");
        IssueResponseDto response = issueService.assignIssue(issueId, dto);
        
        return ResponseEntity.ok(response);
    }

    // --- 4. COMMENTS ---

    /**
     * POST /api/issues/{issueId}/comments : Adds a new comment to an issue.
     */
    @PostMapping("/{issueId}/comments")
    public ResponseEntity<CommentResponseDto> addComment(@PathVariable Long issueId,
                                                       @Valid @RequestBody CommentCreateDto dto) {
    	System.out.println("changeStatus: issueId and ChangeStatusDto to IssueResponseDto");
        // NOTE: Comment author ID in DTO should be ignored in favor of the authenticated user's ID.
        CommentResponseDto response = issueService.addComment(issueId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/issues/{issueId}/comments : Gets paginated list of comments for an issue.
     */
    @GetMapping("/{issueId}/comments")
    public ResponseEntity<Page<CommentResponseDto>> getComments(@PathVariable Long issueId,
                                                              @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
    	System.out.println("changeStatus: issueId and Pageable to Page<CommentResponseDto");
        Page<CommentResponseDto> page = issueService.getComments(issueId, pageable);
        return ResponseEntity.ok(page);
    }

    /**
     * PUT /api/comments/{commentId} : Updates an existing comment.
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(@PathVariable Long commentId,
                                                           @Valid @RequestBody CommentUpdateDto dto) {
    	System.out.println("updateComment: commentId and CommentUpdateDto to CommentResponseDto");
        // NOTE: Service layer must verify the authenticated user is the comment author.
        CommentResponseDto response = issueService.updateComment(commentId, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/comments/{commentId} : Deletes a comment.
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
    	System.out.println("deleteComment: commentId to Void");
        // NOTE: Service layer must verify the authenticated user is the comment author OR an admin.
        issueService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // --- 5. WATCHERS ---

    /**
     * POST /api/issues/{issueId}/watchers : Adds a user (watcher) to an issue.
     */
    @PostMapping("/{issueId}/watchers")
    public ResponseEntity<Void> addWatcher(@PathVariable Long issueId, @Valid @RequestBody WatcherDto dto) {
    	System.out.println("addWatcher: issueId and WatcherDto to Void");
        // NOTE: WatcherDto can contain the user to add, or it can be empty/ignored
        // if the authenticated user is adding themselves.
        issueService.addWatcher(issueId, dto);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/issues/{issueId}/watchers/{userId} : Removes a user from the watcher list.
     */
    @DeleteMapping("/{issueId}/watchers/{userId}")
    public ResponseEntity<Void> removeWatcher(@PathVariable Long issueId, @PathVariable Long userId) {
    	System.out.println("removeWatcher: issueId and userId to Void");
        issueService.removeWatcher(issueId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/issues/{issueId}/watchers : Gets the list of users watching an issue.
     */
    @GetMapping("/{issueId}/watchers")
    public ResponseEntity<Page<UserSummaryDto>> getWatchers(@PathVariable Long issueId, 
                                                            @PageableDefault(size = 10) Pageable pageable) {
    	System.out.println("getWatchers: issueId and Pageable to Page<UserSummaryDto>");
        Page<UserSummaryDto> page = issueService.getWatchers(issueId, pageable);
        return ResponseEntity.ok(page);
    }
}
import React, { useEffect, useState } from 'react';
import IssueService from '../../../api/IssueService';

const IssueExpandedView = ({ issueId, currentUser, onUpdate, viewType }) => {
    const [details, setDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadFullDetails();
        loadComments();
    }, [issueId]);

    const loadFullDetails = () => {
        // Fetch full IssueResponseDto to get Description & Severity
        IssueService.get(issueId).then(res => {
            setDetails(res.data);
            setEditForm({
                title: res.data.title,
                priority: res.data.priority,
                severity: res.data.severity,
                status: res.data.status,
                description: res.data.description || ""
            });
        }).catch(err => {
            console.error("Failed to load issue details", err);
        });
    };

    const loadComments = () => {
        IssueService.getComments(issueId)
            .then(res => {
                const data = res.data;
                let list;

                if (Array.isArray(data)) {
                    // Backend returned a bare array
                    list = data;
                } else if (Array.isArray(data.content)) {
                    // Backend returned Page<CommentResponseDto>
                    list = data.content;
                } else {
                    // Fallback – ensure it's ALWAYS an array
                    list = [];
                }

                setComments(list);
            })
            .catch(err => {
                console.error("Failed to load comments", err);
                setComments([]); // keep it safe
            });
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        IssueService.addComment(issueId, newComment, currentUser.id)
            .then(() => {
                setNewComment("");
                loadComments(); // Reload comments
            })
            .catch(err => {
                console.error("Failed to add comment", err);
                alert("Failed to add comment");
            });
    };

    const handleDeleteComment = (commentId) => {
        if(window.confirm("Delete comment?")) {
            IssueService.deleteComment(commentId)
                .then(() => loadComments())
                .catch(err => {
                    console.error("Failed to delete comment", err);
                    alert("Failed to delete comment");
                });
        }
    };

    const handleSaveEdit = () => {
        const payload = { 
            title: editForm.title,
            priority: editForm.priority,
            severity: editForm.severity,
            description: editForm.description
        };
        
        // 1. Update core fields
        IssueService.update(issueId, payload)
            .then(() => {
                // 2. Status via separate endpoint (if changed)
                if (editForm.status !== details.status) {
                    return IssueService.changeStatus(issueId, editForm.status);
                }
            })
            .then(() => {
                setIsEditing(false);
                loadFullDetails();
                onUpdate(); // refresh the main list
            })
            .catch(err => {
                console.error("Failed to update issue", err);
                alert("Failed to update issue details");
            });
    };

    if (!details) return <div>Loading Details...</div>;

    return (
        <div className="expanded-content">
            {/* --- EDIT MODE --- */}
            {isEditing ? (
                <div className="edit-form">
                    <input
                        className="form-input"
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    />
                    <textarea
                        className="form-input"
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    />
                    
                    <div className="form-row">
                        <label>
                            Priority:
                            <select
                                value={editForm.priority}
                                onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </label>

                        <label>
                            Severity:
                            <select
                                value={editForm.severity}
                                onChange={e => setEditForm({ ...editForm, severity: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </label>

                        <label>
                            Status:
                            <select
                                value={editForm.status}
                                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </label>
                    </div>

                    <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                /* --- VIEW MODE --- */
                <div className="view-mode">
                    <h3>Description</h3>
                    <p>{details.description || "No description provided."}</p>
                    
                    <div className="action-bar">
                        <button className="btn-edit-mode" onClick={() => setIsEditing(true)}>
                            Edit Issue
                        </button>
                    </div>
                </div>
            )}

            {/* --- COMMENTS SECTION --- */}
            <div className="comments-section">
                <h4>Comments</h4>
                <div className="comments-list">
                    {(!Array.isArray(comments) || comments.length === 0) && (
                        <p>No comments yet.</p>
                    )}

                    {Array.isArray(comments) && comments.map(c => (
                        <div key={c.id} className="comment-bubble">
                            <strong>{c.author?.username}</strong>{" "}
                            {c.createdAt && (
                                <span className="date">
                                    {new Date(c.createdAt).toLocaleString()}
                                </span>
                            )}
                            <p>{c.text}</p>

                            {currentUser?.id === c.author?.id && (
                                <button
                                    className="btn-delete-comment"
                                    onClick={() => handleDeleteComment(c.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="add-comment">
                    <input 
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button onClick={handleAddComment}>Add</button>
                </div>
            </div>
        </div>
    );
};

export default IssueExpandedView;

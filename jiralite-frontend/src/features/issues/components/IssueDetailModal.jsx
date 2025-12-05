// src/pages/issues/components/IssueDetailModal.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import './IssueDetailModal.css';

const IssueDetailModal = ({ issue, currentUser, viewType, onClose, onUpdate }) => {
  const [details, setDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    priority: '',
    severity: '',
    status: ''
  });

  useEffect(() => {
    if (!issue?.id) return;
    fetchDetails();
    fetchComments();
  }, [issue?.id]);

  // ---------------- LOADERS ----------------

  const fetchDetails = () => {
    axiosClient
      .get(`/issues/${issue.id}`)
      .then((res) => {
        const data = res.data;
        setDetails(data);
        setEditForm({
          title: data.title,
          priority: data.priority,
          severity: data.severity,
          status: data.status,
        });
      })
      .catch((err) => {
        console.error('Failed to load issue details', err);
      });
  };

  const fetchComments = () => {
    axiosClient
      .get(`/issues/${issue.id}/comments`)
      .then((res) => {
        const data = res.data;
        let list = [];

        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data.content)) list = data.content;

        setComments(list);
      })
      .catch((err) => {
        console.error('Failed to load comments', err);
        setComments([]);
      });
  };

  if (!details) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <p>Loading issue...</p>
        </div>
      </div>
    );
  }

  // ---------------- PERMISSIONS ----------------

  const isReporter = currentUser && details.reporter?.id === currentUser.id;
  const isAssignee = currentUser && details.assignee?.id === currentUser.id;
  const isAdmin = currentUser?.roles?.some((r) => r.name === 'ADMIN');

  // Core fields (title, priority, severity)
  const canEditCore = isReporter || isAssignee || isAdmin;

  // Status rules (must match backend changeStatus logic)
  // Backend: if (isAssignee) -> any; else if (isReporter && CLOSED -> OPEN) -> allowed
  const canChangeStatusAsAssignee = isAssignee;
  const canChangeStatusAsReporter =
    isReporter && details.status === 'CLOSED'; // reporter can only reopen

  const canChangeStatus = isAdmin || canChangeStatusAsAssignee || canChangeStatusAsReporter;

  const canComment = isReporter || isAssignee || isAdmin;

  // ---------------- COMMENTS ACTIONS ----------------

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    axiosClient
      .post(`/issues/${issue.id}/comments`, {
        text: newComment,
        authorId: currentUser.id, // backend uses auth context anyway
      })
      .then(() => {
        setNewComment('');
        fetchComments();
      })
      .catch((err) => {
        console.error('Failed to add comment', err);
        alert('Failed to add comment');
      });
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    axiosClient
      .delete(`/issues/comments/${commentId}`)
      .then(() => fetchComments())
      .catch((err) => {
        console.error('Failed to delete comment', err);
        alert('Failed to delete comment');
      });
  };

  // ---------------- SAVE EDIT ----------------

  const handleSaveEdit = () => {
    setSaving(true);

    const updatePayload = {};

    // Core fields: only include when allowed & changed
    if (canEditCore) {
      if (editForm.title !== details.title) {
        updatePayload.title = editForm.title;
      }
      if (editForm.priority !== details.priority) {
        updatePayload.priority = editForm.priority;
      }
      if (editForm.severity !== details.severity) {
        // Frontend extra rule: if not reporter/admin and severity changed, block
        if (!isReporter && !isAdmin) {
          alert('Only the reporter (or admin) can change severity.');
        } else {
          updatePayload.severity = editForm.severity;
        }
      }
    }

    const promises = [];

    // PATCH /issues/{id} only if we have something to update and canEditCore
    if (canEditCore && Object.keys(updatePayload).length > 0) {
      promises.push(
        axiosClient.patch(`/issues/${issue.id}`, updatePayload)
      );
    }

    // Status PATCH only if allowed & changed
    if (editForm.status !== details.status) {
      if (!canChangeStatus) {
        alert('You are not allowed to change the status of this issue.');
      } else {
        // Reporter extra guard: CLOSED -> OPEN only
        if (
          isReporter &&
          !(details.status === 'CLOSED' && editForm.status === 'OPEN')
        ) {
          alert('Reporter can only change status from CLOSED to OPEN.');
        } else {
          promises.push(
            axiosClient.patch(`/issues/${issue.id}/status`, {
              targetStatus: editForm.status,
            })
          );
        }
      }
    }

    if (promises.length === 0) {
      // Nothing to do
      setSaving(false);
      setEditMode(false);
      return;
    }

    Promise.all(promises)
      .then(() => {
        setEditMode(false);
        setSaving(false);
        fetchDetails();
        onUpdate && onUpdate();
      })
      .catch((err) => {
        console.error('Failed to update issue details', err);
        setSaving(false);
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 403
            ? 'You are not allowed to perform this action.'
            : 'Failed to update issue details');
        alert(msg);
      });
  };

  // ---------------- STATUS OPTIONS ----------------

  const statusOptions = (() => {
    // Full control
    if (canChangeStatusAsAssignee || isAdmin) {
      return ['OPEN', 'IN_PROGRESS', 'REVIEW', 'CLOSED'];
    }

    // Reporter: only CLOSED -> OPEN
    if (canChangeStatusAsReporter) {
      // current is CLOSED, allow OPEN
      return ['CLOSED', 'OPEN'];
    }

    // No control
    return [details.status];
  })();

  const statusDisabled = !canChangeStatus;

  // ---------------- RENDER ----------------

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        {/* HEADER */}
        <div className="modal-header">
          {editMode ? (
            <input
              className="edit-title-input"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              disabled={!canEditCore}
            />
          ) : (
            <h2>{details.title}</h2>
          )}

          {(canEditCore || canChangeStatus) && !editMode && (
            <button
              className="btn-sm btn-edit"
              onClick={() => setEditMode(true)}
            >
              Edit Details
            </button>
          )}

          {editMode && (
            <div className="edit-actions">
              <button
                className="btn-sm btn-save"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn-sm btn-cancel"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* GRID */}
        <div className="modal-grid">
          <div className="detail-item">
            <label>Status:</label>
            {editMode ? (
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                disabled={statusDisabled}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={`status-badge status-${details.status.toLowerCase()}`}
              >
                {details.status}
              </span>
            )}
          </div>

          <div className="detail-item">
            <label>Priority:</label>
            {editMode ? (
              <select
                value={editForm.priority}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    priority: e.target.value,
                  })
                }
                disabled={!canEditCore}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            ) : (
              <span
                className={`priority-tag priority-${details.priority.toLowerCase()}`}
              >
                {details.priority}
              </span>
            )}
          </div>

          <div className="detail-item">
            <label>Severity:</label>
            {editMode ? (
              <select
                value={editForm.severity}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    severity: e.target.value,
                  })
                }
                disabled={!canEditCore}
              >
                {/* Change these if your enum is different */}
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
              </select>
            ) : (
              <span className="severity-tag">
                {details.severity || 'N/A'}
              </span>
            )}
          </div>

          <div className="detail-item">
            <label>Reporter:</label>
            <span>{details.reporter?.username || 'Unknown'}</span>
          </div>
          <div className="detail-item">
            <label>Assignee:</label>
            <span>{details.assignee?.username || 'Unassigned'}</span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="modal-section">
          <h3>Description</h3>
          <div className="description-box">
            {details.description || 'No description provided.'}
          </div>
        </div>

        {/* COMMENTS */}
        <div className="modal-section">
          <h3>Comments</h3>
          <div className="comments-list">
            {canComment ? (
              Array.isArray(comments) && comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{c.author?.username || 'Unknown'}</strong>
                      {c.createdAt && (
                        <span className="comment-date">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      )}
                      {(isAdmin || c.author?.id === currentUser.id) && (
                        <button
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p>{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No comments yet.</p>
              )
            ) : (
              <p className="no-data">
                You do not have permission to view comments.
              </p>
            )}
          </div>

          {canComment && (
            <form
              onSubmit={handleAddComment}
              className="comment-form"
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                required
              />
              <button type="submit" className="btn-primary">
                Post Comment
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;

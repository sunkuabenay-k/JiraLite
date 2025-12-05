import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IssueService from '../../../api/IssueService';
import './IssueForm.css'; // <-- Make sure this file exists

const IssueForm = () => {
  const { issueId } = useParams();
  const isEdit = Boolean(issueId);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'LOW',
    severity: 'S4',
    type: 'BUG',
    status: 'OPEN',
    assigneeId: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  // Load issue if editing
  useEffect(() => {
    if (!isEdit) return;

    setLoading(true);
    IssueService.get(issueId)
      .then((res) => {
        const data = res.data;
        setForm({
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || 'LOW',
          severity: data.severity || 'S4',
          type: data.type || 'BUG',
          status: data.status || 'OPEN',
          assigneeId: data.assignee?.id || '',
        });
      })
      .catch(() => setError('Failed to load issue for editing.'))
      .finally(() => setLoading(false));
  }, [isEdit, issueId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      severity: form.severity,
      type: form.type,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
    };

    try {
      if (isEdit) {
        await IssueService.update(issueId, { ...payload, status: form.status });
      } else {
        await IssueService.create(payload);
      }

      navigate('/issues');
    } catch (err) {
      const msg = err.response?.data?.message || 'An error occurred.';
      setError(`Failed to save: ${msg}`);
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="issue-form-container">
      <h1 className="issue-form-title">{isEdit ? 'Edit Issue' : 'Create New Issue'}</h1>

      {error && <div className="issue-form-error">{error}</div>}

      <form className="issue-form-card" onSubmit={handleSubmit}>

        {/* Title */}
        <label className="issue-form-label">Title</label>
        <input
          name="title"
          className="issue-form-input"
          value={form.title}
          onChange={handleChange}
          placeholder="Short summary of the issue"
          required
        />

        {/* Description */}
        <label className="issue-form-label">Description</label>
        <textarea
          name="description"
          className="issue-form-textarea"
          rows={5}
          value={form.description}
          onChange={handleChange}
        />

        {/* Grid Group */}
        <div className="issue-form-row-3">
          {/* Type */}
          <div>
            <label className="issue-form-label">Type</label>
            <select
              name="type"
              className="issue-form-select"
              value={form.type}
              onChange={handleChange}
            >
              <option value="BUG">BUG</option>
              <option value="TASK">TASK</option>
              <option value="FEATURE">FEATURE</option>
              <option value="IMPROVEMENT">IMPROVEMENT</option>
            </select>
          </div>

          {/* Priority */}
          <div className="center-field">
            <label className="issue-form-label">Priority</label>
            <select
              name="priority"
              className="issue-form-select"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Severity */}
          <div  style={{ textAlign: "right" }}> 
            <label className="issue-form-label">Severity</label>
            <select
              name="severity"
              className="issue-form-select"
              value={form.severity}
              onChange={handleChange}
            >
              <option value="S1">S1 (Critical)</option>
              <option value="S2">S2 (Major)</option>
              <option value="S3">S3 (Minor)</option>
              <option value="S4">S4 (Trivial)</option>
            </select>
          </div>

          {/* Status (if edit mode) */}
          {isEdit && (
            <div>
              <label className="issue-form-label">Status</label>
              <select
                name="status"
                className="issue-form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          )}
        </div>

        {/* Assignee */}
        <label className="issue-form-label">Assignee ID (Optional)</label>
        <input
          type="number"
          name="assigneeId"
          className="issue-form-input"
          value={form.assigneeId}
          onChange={handleChange}
          placeholder="Enter User ID"
        />

        {/* Buttons */}
        <div className="issue-form-buttons">
          <button type="submit" className="issue-form-create-btn">
            {isEdit ? 'Save Changes' : 'Create Issue'}
          </button>

          <button
            type="button"
            className="issue-form-cancel-btn"
            onClick={() => navigate('/issues')}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default IssueForm;

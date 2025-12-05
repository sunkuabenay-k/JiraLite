import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import IssueService from '../../../api/IssueService';
import IssueDetailModal from '../components/IssueDetailModal';
import './IssueListPage.css';

const IssueListPage = () => {
  /* ---------------------------------------------------------------------------
     Local State
  --------------------------------------------------------------------------- */
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL parameters
  const filterType = searchParams.get('filter'); // my | claims | unassigned
  const searchQuery = searchParams.get('search'); // global search bar

  // Dropdown filter state
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    status: '',
    severity: ''
  });

  /* ---------------------------------------------------------------------------
     Load Current User
  --------------------------------------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');

    setCurrentUser(JSON.parse(stored));
  }, [navigate]);

  /* ---------------------------------------------------------------------------
     Fetch Issues whenever filters or query change
  --------------------------------------------------------------------------- */
  useEffect(() => {
    if (currentUser) fetchIssues();
  }, [filterType, searchQuery, currentUser, filters]);

  /* ---------------------------------------------------------------------------
     API Fetch
  --------------------------------------------------------------------------- */
  const fetchIssues = () => {
    setLoading(true);

    const params = { size: 50, page: 0 };

    // Sidebar filters
    if (filterType === 'my') params.reporterId = currentUser.id;
    if (filterType === 'claims') params.assigneeId = currentUser.id;

    // Global search
    if (searchQuery) {
      if (!isNaN(searchQuery)) params.issue_id = searchQuery;
      else params.title = searchQuery;
    }

    // Dropdown filters
    if (filters.type) params.type = filters.type;
    if (filters.priority) params.priority = filters.priority;
    if (filters.status) params.status = filters.status;
    if (filters.severity) params.severity = filters.severity;

    IssueService.getAll(params)
      .then((res) => {
        let data = res.data.content || res.data;

        // Filter: unassigned issues
        if (filterType === 'unassigned') {
          data = data.filter(i => !i.assignee);
        }

        setIssues(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  /* ---------------------------------------------------------------------------
     Handlers
  --------------------------------------------------------------------------- */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({ type: '', priority: '', status: '', severity: '' });

  const handleClaim = (e, id, issue) => {
    e.stopPropagation();
    if (!currentUser) return;

    // Prevent claiming your own issue
    if (issue.reporter && issue.reporter.id === currentUser.id) {
      return alert("You cannot claim an issue you reported.");
    }

    IssueService.assign(id, currentUser.id)
      .then(fetchIssues)
      .catch(err => {
        alert(err.response?.data?.message || "Failed to claim issue.");
      });
  };

  /* ---------------------------------------------------------------------------
     Helpers
  --------------------------------------------------------------------------- */
  const getTitle = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (filterType === 'my') return 'My Reported Issues';
    if (filterType === 'claims') return 'My Claimed Issues';
    if (filterType === 'unassigned') return 'Unassigned Issues';
    return 'All Issues';
  };

  const highlightTitle = (title, q) => {
    if (!title || !q) return title;
    const lower = title.toLowerCase();
    const query = q.toLowerCase();
    const index = lower.indexOf(query);
    if (index === -1) return title;

    return (
      <span>
        {title.slice(0, index)}
        <mark className="highlight-match">
          {title.slice(index, index + q.length)}
        </mark>
        {title.slice(index + q.length)}
      </span>
    );
  };

  /* ---------------------------------------------------------------------------
     Render
  --------------------------------------------------------------------------- */
  return (
    <div className="dashboard-wrap">

      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="page-title">{getTitle()}</h2>
        </div>

        {/* Toolbar Filters */}
        <div className="filter-toolbar compact">
          {['type', 'priority', 'status', 'severity'].map(field => (
            <select
              key={field}
              name={field}
              value={filters[field]}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </option>

              {field === 'type' && <>
                <option value="BUG">Bug</option>
                <option value="TASK">Task</option>
                <option value="FEATURE">Feature</option>
                <option value="IMPROVEMENT">Improvement</option>
              </>}

              {field === 'priority' && <>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
                <option value="URGENT">Urgent</option>
              </>}

              {field === 'status' && <>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="CLOSED">Closed</option>
              </>}

              {field === 'severity' && <>
                <option value="S1">S1 (Critical)</option>
                <option value="S2">S2 (Major)</option>
                <option value="S3">S3 (Minor)</option>
                <option value="S4">S4 (Trivial)</option>
              </>}
            </select>
          ))}

          {(filters.type || filters.priority || filters.status || filters.severity) && (
            <button onClick={clearFilters} className="btn-clear-filters">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content-full">
        <main className="main-column-full">
          {loading ? (
            <div className="loading-card">Loading...</div>
          ) : issues.length === 0 ? (
            <div className="empty-card">
              <h3>No issues found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {issues.map(issue => {
                const isReporter = issue.reporter?.id === currentUser?.id;
                const isAssignee = issue.assignee?.id === currentUser?.id;
                const canClaim = !issue.assignee && !isReporter;

                return (
                  <article
                    key={issue.id}
                    className="issue-card"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    {/* Card Header */}
                    <div className="card-top">
                      <div className="type-block">
                        <span className="type-badge">{issue.type}</span>
                        <span className="id-text">#{issue.id}</span>
                      </div>

                      <div className="meta-block">
                        {issue.severity && (
                          <span className="status-pill">{issue.severity}</span>
                        )}
                        <span className={`status-pill status-${issue.status?.toLowerCase()}`}>
                          {issue.status}
                        </span>
                        <span className={`priority-pill priority-${issue.priority?.toLowerCase()}`}>
                          {issue.priority}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="card-title">
                      {searchQuery ? highlightTitle(issue.title, searchQuery) : issue.title}
                    </h3>

                    {/* Reporter / Assignee */}
                    <div className="card-foot">
                      Rep: {issue.reporter?.username || 'Unknown'} &bull; 
                      {' '}
                      Assignee:{' '}
                      {issue.assignee ? issue.assignee.username : <em>Unassigned</em>}
                    </div>

                    {/* Actions */}
                    <div className="card-actions">
                      {canClaim ? (
                        <button
                          className="btn-claim"
                          onClick={(e) => handleClaim(e, issue.id, issue)}
                        >
                          Claim Issue
                        </button>
                      ) : (
                        <span className="claim-reason">
                          {issue.assignee
                            ? isAssignee
                              ? 'Assigned to you'
                              : 'Already assigned'
                            : 'You reported this'}
                        </span>
                      )}

                      <button
                        className="btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          currentUser={currentUser}
          onClose={() => setSelectedIssue(null)}
          onUpdate={fetchIssues}
        />
      )}
    </div>
  );
};

export default IssueListPage;

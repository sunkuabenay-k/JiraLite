import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import IssueService from '../../../api/IssueService';
import IssueDetailModal from '../components/IssueDetailModal';
import './IssueListPage.css';

const IssueListPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('filter'); // 'my', 'claims', etc.
  const searchQuery = searchParams.get('search'); // Global search
  const navigate = useNavigate();

  // Local state for dropdown filters
  const [filters, setFilters] = useState({
    priority: '',
    severity: '',
    status: '',
    type: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    else navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    // Fix: If a global search query exists, we probably want to ignore/reset dropdowns 
    // unless you want very complex "Search AND Filter" logic. 
    // For simplicity and better UX, we'll keep them active but user should know.
    fetchIssues();
  }, [filterType, searchQuery, currentUser, filters]);

  const fetchIssues = () => {
    setLoading(true);
    const params = { size: 50, page: 0 };

    // 1. URL Filters (Sidebar links)
    if (filterType === 'my') params.reporterId = currentUser.id;
    else if (filterType === 'claims') params.assigneeId = currentUser.id;

    // 2. Global Search (Header)
    if (searchQuery) {
      if (!isNaN(searchQuery)) params.issue_id = searchQuery;
      else params.title = searchQuery;
    }

    // 3. Dropdown Filters
    if (filters.priority) params.priority = filters.priority;
    if (filters.severity) params.severity = filters.severity;
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;

    IssueService.getAll(params)
      .then((res) => {
        let data = res.data.content || res.data;
        // Client-side filter for Unassigned (if backend doesn't support explicit null check via param)
        if (filterType === 'unassigned') data = data.filter(i => !i.assignee);
        setIssues(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ priority: '', severity: '', status: '', type: '' });

  // Fix: Stop propagation carefully
  const handleClaim = (e, id, issue) => {
    e.stopPropagation(); 
    if (!currentUser) return;
    
    // Safety check just in case
    const isReporter = issue.reporter && issue.reporter.id === currentUser.id;
    if (isReporter) {
      alert("You reported this, so you can't claim it.");
      return;
    }

    IssueService.assign(id, currentUser.id)
      .then(() => {
        // Refresh list to show updated assignee
        fetchIssues();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Could not claim issue.';
        alert(msg);
      });
  };

  const getTitle = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (filterType === 'my') return 'My Reported Issues';
    if (filterType === 'claims') return 'My Claims';
    if (filterType === 'unassigned') return 'Unassigned Issues';
    return 'All Issues';
  };

  // Safe highlighter
  const highlightTitle = (title, q) => {
    if (!title || !q) return title;
    const lowerTitle = title.toLowerCase();
    const lowerQ = q.toLowerCase();
    const idx = lowerTitle.indexOf(lowerQ);
    if (idx === -1) return title;
    
    return (
      <span>
        {title.slice(0, idx)}
        <mark className="highlight-match">{title.slice(idx, idx + q.length)}</mark>
        {title.slice(idx + q.length)}
      </span>
    );
  };

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-header">
        <div>
          <h2 className="page-title">{getTitle()}</h2>
          <div className="sub-title">Overview of current tasks and bugs</div>
        </div>

        <div className="filter-toolbar compact">
           {/* Dropdowns */}
           {['type', 'priority', 'status'].map(field => (
             <select 
               key={field} 
               name={field} 
               value={filters[field]} 
               onChange={handleFilterChange} 
               className="filter-select"
             >
               <option value="">{field.charAt(0).toUpperCase() + field.slice(1)}</option>
               {/* Simplified options for brevity, ensure these match Backend Enums exactly */}
               {field === 'type' && <>
                 <option value="BUG">Bug</option><option value="TASK">Task</option>
               </>}
               {field === 'priority' && <>
                 <option value="LOW">Low</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
               </>}
               {field === 'status' && <>
                 <option value="OPEN">Open</option><option value="CLOSED">Closed</option>
               </>}
             </select>
           ))}

           {(filters.type || filters.priority || filters.status) && (
             <button onClick={clearFilters} className="btn-clear-filters">Reset</button>
           )}
        </div>
      </div>

      <div className="dashboard-grid">
        <main className="main-column">
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
                const isReporter = issue.reporter && currentUser && issue.reporter.id === currentUser.id;
                const isAssignee = issue.assignee && currentUser && issue.assignee.id === currentUser.id;
                // You can only claim if it has NO assignee AND you are NOT the reporter
                const canClaim = !issue.assignee && !isReporter;

                return (
                  <article 
                    key={issue.id} 
                    className="issue-card"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="card-top">
                      <div className="type-block">
                        <span className="type-badge">{issue.type || 'TASK'}</span>
                        <span className="id-text">#{issue.id}</span>
                      </div>
                      <div className="meta-block">
                        <span className={`status-pill status-${(issue.status||'').toLowerCase()}`}>{issue.status}</span>
                        <span className={`priority-pill priority-${(issue.priority||'').toLowerCase()}`}>{issue.priority}</span>
                      </div>
                    </div>

                    <h3 className="card-title">
                      {searchQuery ? highlightTitle(issue.title, searchQuery) : issue.title}
                    </h3>

                    <div className="card-foot">
                      Rep: {issue.reporter?.username || 'Unknown'} &bull; Assignee: {issue.assignee ? issue.assignee.username : <em>Unassigned</em>}
                    </div>

                    <div className="card-actions">
                      {canClaim ? (
                        <button className="btn-claim" onClick={(e) => handleClaim(e, issue.id, issue)}>Claim Issue</button>
                      ) : (
                        <span className="claim-reason">
                          {issue.assignee ? (isAssignee ? "Assigned to you" : "Already assigned") : "You reported this"}
                        </span>
                      )}
                      
                      {/* View button calls the row click, but we explicitly stop prop to prevent double events if necessary */}
                      <button className="btn-view" onClick={(e) => { e.stopPropagation(); setSelectedIssue(issue); }}>
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <aside className="side-column">
           <div className="stat-card">
              <div className="stat-value">{issues.length}</div>
              <div className="stat-label">Visible Issues</div>
           </div>
           
           <div className="mini-cards">
             <div className="mini-card">
               <span className="mini-title">Urgent</span>
               <span className="mini-value" style={{color:'#ef4444'}}>
                 {issues.filter(i => i.priority === 'URGENT').length}
               </span>
             </div>
             <div className="mini-card">
               <span className="mini-title">Open Bugs</span>
               <span className="mini-value" style={{color:'#6366f1'}}>
                 {issues.filter(i => i.type === 'BUG' && i.status === 'OPEN').length}
               </span>
             </div>
           </div>
        </aside>
      </div>

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
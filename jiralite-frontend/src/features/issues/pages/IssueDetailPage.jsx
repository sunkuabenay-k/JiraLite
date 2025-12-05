import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import IssueService from '../../../api/IssueService';
import IssueDetailModal from '../components/IssueDetailModal'; // Import Modal
import './IssueListPage.css';

const IssueListPage = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null); // For Modal
    
    const [searchParams] = useSearchParams();
    const filterType = searchParams.get('filter'); 

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchIssues();
        }
    }, [filterType, currentUser]);

    const fetchIssues = () => {
        setLoading(true);
        
        // Basic Pagination
        const params = { size: 50, page: 0 };

        // 1. FILTER: MY REPORTED
        if (filterType === 'my' && currentUser) {
            params.reporterId = currentUser.id;
        }
        // 2. FILTER: MY CLAIMS (New)
        else if (filterType === 'claims' && currentUser) {
            params.assigneeId = currentUser.id;
        }

        IssueService.getAll(params)
            .then(response => {
                let data = response.data.content || response.data;
                
                // 3. FILTER: UNASSIGNED (Client side filtering)
                if (filterType === 'unassigned') {
                    data = data.filter(i => i.assignee === null);
                }

                setIssues(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleClaimIssue = (e, id) => {
        e.stopPropagation(); // Prevent opening modal
        if (!currentUser) return;
        
        axiosClient.patch(`/issues/${id}/assignee`, { assigneeId: currentUser.id })
            .then(() => {
                alert("Issue assigned to you!");
                fetchIssues(); // REFRESH LIST TO UPDATE UI
            })
            .catch(err => alert("Failed to claim issue"));
    };

    const handleIssueClick = (issue) => {
        setSelectedIssue(issue);
    };

    const handleModalClose = () => {
        setSelectedIssue(null);
    };

    const handleModalUpdate = () => {
        fetchIssues(); // Refresh list details
        // Also refresh the selected issue object to update modal content
        IssueService.get(selectedIssue.id).then(res => setSelectedIssue(res.data));
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="issue-list-container">
            <div className="page-header">
                <h1 className="page-title">
                    {filterType === 'my' ? 'My Reported Issues' : 
                     filterType === 'unassigned' ? 'Unassigned Issues' : 
                     filterType === 'claims' ? 'My Claimed Issues' :
                     'All Issues'}
                </h1>
            </div>
            
            {issues.length === 0 ? (
                <div className="empty-state">No issues found.</div>
            ) : (
                <div className="issue-grid">
                    {issues.map(issue => {
                        const isUnassigned = !issue.assignee;
                        // Allow reporter to claim their own issue if unassigned
                        const canClaim = isUnassigned; 

                        return (
                            <div 
                                key={issue.id} 
                                className={`issue-card status-${issue.status.toLowerCase()}`}
                                onClick={() => handleIssueClick(issue)} // OPEN MODAL ON CLICK
                                style={{cursor: 'pointer'}}
                            >
                                <h2 className="issue-title">{issue.title}</h2>
                                
                                <div className="meta-info">
                                    <span className={`status-badge status-${issue.status.toLowerCase()}`}>{issue.status}</span>
                                    <span className={`priority-tag priority-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                                    <span className="type-tag">{issue.type}</span>
                                </div>

                                <p className="assignee-text">
                                    <strong>Assignee:</strong> {issue.assignee ? issue.assignee.username : <span className="unassigned">Unassigned</span>}
                                </p>
                                <p className="reporter-text">
                                    <strong>Reporter:</strong> {issue.reporter?.username || 'Unknown'}
                                </p>

                                {/* Only show Claim button in card, other actions moved to modal */}
                                <div className="card-actions">
                                    {canClaim && (
                                        <button 
                                            className="btn-sm btn-claim"
                                            onClick={(e) => handleClaimIssue(e, issue.id)}
                                        >
                                            Claim Issue
                                        </button>
                                    )}
                                    <span className="click-hint">Click to view/edit</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedIssue && (
                <IssueDetailModal 
                    issue={selectedIssue} 
                    currentUser={currentUser} 
                    onClose={handleModalClose}
                    onUpdate={handleModalUpdate}
                />
            )}
        </div>
    );
};

export default IssueListPage;
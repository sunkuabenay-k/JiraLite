import axiosClient from './axiosClient';

const base = '/issues';

const IssueService = {
    getAll: (params = {}) => axiosClient.get(base, { params }),
    get: (issueId) => axiosClient.get(`${base}/${issueId}`),
    
    // Includes Severity in payload
    create: (payload) => axiosClient.post(base, payload),
    
    // Updates
    update: (issueId, payload) => axiosClient.patch(`${base}/${issueId}`, payload),
    
    // FIXED: Use 'targetStatus' as per ChangeStatusDto
    changeStatus: (id, status) => axiosClient.patch(`${base}/${id}/status`, { targetStatus: status }),
    
    assign: (issueId, assigneeId) => axiosClient.patch(`${base}/${issueId}/assignee`, { assigneeId }),
    
    // Comments
    addComment: (issueId, text, authorId) => axiosClient.post(`${base}/${issueId}/comments`, { text, authorId }),
    getComments: (issueId) => axiosClient.get(`${base}/${issueId}/comments`),
    deleteComment: (commentId) => axiosClient.delete(`/comments/${commentId}`),
};

export default IssueService;
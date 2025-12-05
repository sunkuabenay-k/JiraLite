import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import IssueListPage from './features/issues/pages/IssueListPage';
import LoginPage from './features/users/pages/LoginPage';
import RegisterPage from './features/users/pages/RegisterPage';

// Note: Ensure these components exist or create placeholders if missing
import IssueDetailPage from './features/issues/pages/IssueDetailPage'; 
import IssueForm from './features/issues/components/IssueForm';

function App() {
  return (
    <Router>
      <Header />
      <div className="main-content">
        <Routes>
          {/* Redirect root to issues or login */}
          <Route path="/" element={<Navigate to="/issues" replace />} />
          
          {/* Main Dashboard */}
          <Route path="/issues" element={<IssueListPage />} />

          {/* Issue CRUD */}
          <Route path="/issues/create" element={<IssueForm />} />
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/issues/edit/:issueId" element={<IssueForm />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
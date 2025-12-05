import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  // Retrieve token and current user from localStorage
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('currentUser');
  const user = userString ? JSON.parse(userString) : null;

  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    navigate(`/issues?search=${encodeURIComponent(q)}`);
    setSearchTerm('');
  };

  const clearSearch = () => setSearchTerm('');

  // const getInitials = (name) => {
  //   if (!name) return 'U';
  //   const parts = name.split(' ');
  //   return parts.length === 1
  //     ? parts[0].charAt(0).toUpperCase()
  //     : (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  // };

  return (
    <header className="app-header card-header">
      <div className="header-content">

        {/* LEFT SECTION */}
        <div className="left-section">
          <h1 className="logo-link">
            <Link to={token ? "/issues" : "/login"} className="logo-inner">
              <svg width="120" height="32" viewBox="0 0 120 32">
                <text x="0" y="24" fontFamily="sans-serif" fontWeight="800" fontSize="24" fill="#334155">
                  Jira<tspan fill="#818cf8">Lite</tspan>
                </text>
              </svg>
            </Link>
          </h1>

          {token && (
            <nav className="mini-nav">
              <Link to="/issues?filter=my" className="mini-nav-item">My Reported</Link>
              <Link to="/issues?filter=claims" className="mini-nav-item">My Claims</Link>
              <Link to="/issues?filter=unassigned" className="mini-nav-item">Unassigned</Link>
            </nav>
          )}
        </div>

        {/* CENTER SECTION: Search */}
        {token && (
          <form onSubmit={handleSearch} className="header-search">
            <div className="header-search-large">
              <span className="search-icon"></span>
              <input
                className="header-search-input"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="search-clear" onClick={clearSearch}>✕</button>
              )}
            </div>
            <button type="submit" className="header-search-btn">Search</button>
          </form>
        )}

        {/* RIGHT SECTION */}
        <div className="right-section">
          {token ? (
            <>
              <Link to="/issues/create" className="create-btn">+ Create</Link>

              {/* Avatar */}
              <div className="avatar-wrap" title={user?.username}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" />
                ) : (
                  <span className="avatar-text">{user?.username}</span>
                )}
              </div>

              <button className="logout-btn small" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="mini-nav-item">Login</Link>
              <Link to="/register" className="create-btn">Sign Up</Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;

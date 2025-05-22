import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token') !== null;

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">BOOMFLIX</Link>
          <div className="navbar-links">
            <Link to="/" className="navbar-link">Home</Link>
            <Link to="/browse" className="navbar-link">Browse</Link>
            <Link to="/trending" className="navbar-link">Trending</Link>
            <Link to="/my-list" className="navbar-link">My List</Link>
          </div>
        </div>
        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              <Link to="/upload" className="upload-btn">Upload Video</Link>
              <div className="profile-dropdown">
                <img src="/profile-user.png" alt="Profile" className="profile-icon" />
                <div className="dropdown-content">
                  <Link to="/profile">My Profile</Link>
                  <Link to="/settings">Settings</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Sign In</Link>
              <Link to="/register" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
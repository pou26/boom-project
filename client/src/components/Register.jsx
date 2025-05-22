import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password,
          rememberMe 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        // Handle successful registration
        // You can add your navigation logic here
        alert('Registration successful! Please sign in.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="register-container">
      {/* Background */}
      <div className="register-background"></div>

      {/* Registration Form */}
      <div className="form-container">
        <h1 className="form-title">Sign Up</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or phone number"
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input password-input"
              required
              disabled={isLoading}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={togglePassword}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Sign Up Button */}
          <button 
            type="submit" 
            className={`sign-up-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Remember me checkbox */}
        <div className="checkbox-container">
          <input 
            type="checkbox" 
            id="remember" 
            className="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="remember" className="checkbox-label">
            Remember me
          </label>
        </div>

        {/* Sign in link */}
        <div className="sign-in-link">
          <span>Already have Netflix? </span>
                  <Link to="/login" className="signup-link">
                    Sign in now
                  </Link>
        </div>

        {/* Terms and privacy */}
        <div className="recaptcha-notice">
          <p>
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
            <span className="learn-more">Learn more.</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <p className="footer-title">Questions? Contact us.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">FAQ</a>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Terms of Use</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Cookie Preferences</a>
            <a href="#" className="footer-link">Corporate Information</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
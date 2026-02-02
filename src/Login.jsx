import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email.trim()) {
        setError('Please enter your email');
        setLoading(false);
        return;
      }

      // Request OTP
      const response = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      // Store email in session storage for OTP verification
      sessionStorage.setItem('adminEmail', email.toLowerCase());
      setSuccess(`OTP sent to ${data.email}`);

      // Redirect to OTP verification page after 1 second
      setTimeout(() => {
        navigate('/verify-otp');
      }, 1000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>MultiYo Admin</h1>
          <p>Secure Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="login-info">
          <p>
            An OTP will be sent to your registered email address. 
            Use it to verify your identity and access the dashboard.
          </p>
        </div>
      </div>

      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>
    </div>
  );
}

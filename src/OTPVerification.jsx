import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './OTPVerification.css';

export default function OTPVerification() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('adminEmail');
    if (!storedEmail) {
      navigate('/login');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setError('OTP expired. Please request a new one.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    // Handle paste - if value has multiple digits, distribute them
    if (value.length > 1) {
      const digits = value.split('').filter(d => /^\d$/.test(d)).slice(0, 6 - index);
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus on next empty field or last field
      const nextIndex = Math.min(index + digits.length, 5);
      setTimeout(() => {
        document.getElementById(`otp-input-${nextIndex}`).focus();
      }, 0);
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    if (digits.length > 0) {
      setOtp(digits);
      setError('');
      
      // Focus on last pasted digit or last field
      const lastIndex = Math.min(digits.length - 1, 5);
      setTimeout(() => {
        document.getElementById(`otp-input-${lastIndex}`).focus();
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Update authentication state using AuthContext
      login(data.token, data.email);

      // Clear session storage
      sessionStorage.removeItem('adminEmail');

      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimeLeft(300);
        setOtp(['', '', '', '', '', '']);
        setError('');
        document.getElementById('otp-input-0').focus();
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <h1>Verify Your Email</h1>
          <p>Enter the 6-digit code sent to</p>
          <p className="email-display">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-hint">
            <small> Tip: Paste the OTP code from your email</small>
          </div>
          
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="otp-input"
                autoComplete="off"
                placeholder="•"
              />
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            className="verify-btn"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="otp-footer">
            <div className="timer-section">
              <span className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="timer-label">seconds remaining</span>
            </div>

            <button
              type="button"
              className="resend-btn"
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        </form>

        <div className="otp-info">
          <p>
            Didn't receive the code? Check your spam folder or try requesting a new one.
          </p>
        </div>
      </div>

      <div className="otp-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>
    </div>
  );
}

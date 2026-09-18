import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, isCms: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      if (data.requires2FA) {
        setStep(2);
      } else {
        localStorage.setItem('token', data.token);
        if (data.requirePasswordChange) {
          navigate('/force-password-change');
        } else {
          setIsAuthenticated(true);
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code, isCms: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Verification failed');
      }

      localStorage.setItem('token', data.token);
      
      if (data.requirePasswordChange) {
        navigate('/force-password-change');
      } else {
        setIsAuthenticated(true);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to send reset code');
      }

      setSuccessMsg(data.msg || 'Verification code sent to your email.');
      setForgotStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Password reset failed');
      }

      setSuccessMsg(data.msg || 'Password reset successfully! You can now log in.');
      setIsForgotMode(false);
      setEmail(resetEmail);
      setPassword('');
      setForgotStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '420px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <img src="/logo.png" alt="ITV Logo" style={{ maxWidth: '100px', width: '100%', height: 'auto', objectFit: 'contain' }} />
      </div>

      <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem' }}>
        {isForgotMode 
          ? (forgotStep === 1 ? 'Reset Password' : 'Enter Reset OTP')
          : (step === 1 ? 'Welcome Back' : 'Two-Factor Verification')}
      </h2>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
      {successMsg && <div style={{ color: '#2ecc71', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{successMsg}</div>}

      {/* Forgot Password Flow */}
      {isForgotMode ? (
        forgotStep === 1 ? (
          <form onSubmit={handleSendResetOTP}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Enter your registered email address to receive a 6-digit password reset verification code.
            </p>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => { setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit}>
            <p style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Verification code sent to <strong>{resetEmail}</strong>.
            </p>
            <div className="form-group">
              <label>6-Digit Verification Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Set New Password'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => setForgotStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )
      ) : (
        /* Normal Login Flow */
        step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                  onClick={() => { setIsForgotMode(true); setResetEmail(email); setError(''); setSuccessMsg(''); }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>
              We've sent a 6-digit verification code to <strong>{email}</strong>.
            </p>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '10px' }} 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )
      )}
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      if (data.requires2FA) {
        setStep(2);
      } else {
        // Fallback for older tokens or if 2FA is bypassed (though backend enforces it now)
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
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
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

  return (
    <div className="glass animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <img src="/logo.png" alt="ITV Logo" style={{ maxWidth: '100px', width: '100%', height: 'auto', objectFit: 'contain' }} />
      </div>
      <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem' }}>
        {step === 1 ? 'Welcome Back' : 'Two-Factor Verification'}
      </h2>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      {step === 1 ? (
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
            <label>Password</label>
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
      )}

      {step === 1 && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)' }}>Sign up</Link>
        </p>
      )}
    </div>
  );
};

export default Login;

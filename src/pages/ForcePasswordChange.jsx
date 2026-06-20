import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForcePasswordChange = ({ setIsAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/auth/force-change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update password');
      }

      setIsAuthenticated(true);
      navigate('/');
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
      <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.8rem' }}>Set New Password</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-secondary)' }}>
        For your security, you must set a new password before accessing the CMS dashboard.
      </p>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? 'Updating...' : 'Update & Continue'}
        </button>
      </form>
    </div>
  );
};

export default ForcePasswordChange;

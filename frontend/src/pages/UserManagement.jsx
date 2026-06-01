import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldAlert, Edit2, X, Save } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, activePlans: 0, admins: 0 });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({});
  const [token] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        calculateMetrics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateMetrics = (data) => {
    const total = data.length;
    const activePlans = data.filter(u => u.activePlans && u.activePlans.length > 0).length;
    const admins = data.filter(u => u.role === 'admin' || u.role === 'superAdmin').length;
    setMetrics({ total, activePlans, admins });
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditData({
      username: user.username,
      email: user.email,
      mobile: user.mobile || '',
      role: user.role
    });
  };

  const handleSave = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editData)
      });
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">User Management</h1>
      
      {/* Metrics */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Users size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Users</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{metrics.total}</p>
          </div>
        </div>
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <UserCheck size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Active Subscribers</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{metrics.activePlans}</p>
          </div>
        </div>
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ShieldAlert size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Admins</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{metrics.admins}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass table-container" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>User ID</th>
              <th style={{ padding: '12px' }}>Username</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Mobile</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Active Plans</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user._id}</td>
                <td style={{ padding: '12px' }}>
                  {editingUserId === user._id ? (
                    <input className="form-control" style={{ padding: '6px' }} value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} />
                  ) : user.username}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingUserId === user._id ? (
                    <input className="form-control" style={{ padding: '6px' }} value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                  ) : user.email}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingUserId === user._id ? (
                    <input className="form-control" style={{ padding: '6px' }} value={editData.mobile} onChange={e => setEditData({...editData, mobile: e.target.value})} />
                  ) : (user.mobile || '-')}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingUserId === user._id ? (
                    <select className="form-control" style={{ padding: '6px' }} value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : <span className="badge">{user.role}</span>}
                </td>
                <td style={{ padding: '12px' }}>
                  {user.activePlans && user.activePlans.length > 0 ? (
                    user.activePlans.map((p, i) => <span key={i} className="badge">{p.planName}</span>)
                  ) : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingUserId === user._id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" style={{ color: 'var(--success)' }} onClick={() => handleSave(user._id)}><Save size={18} /></button>
                      <button className="icon-btn delete" onClick={() => setEditingUserId(null)}><X size={18} /></button>
                    </div>
                  ) : (
                    <button className="icon-btn" onClick={() => handleEditClick(user)}><Edit2 size={18} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldAlert, Edit2, X, Save, AlertTriangle, Send, Loader2, Trash2, Plus } from 'lucide-react';
import { getUserRole, getUserId } from '../utils/auth';

export default function UserManagement() {
  const userRole = getUserRole();
  const currentUserId = getUserId();
  const [users, setUsers] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, activePlans: 0, admins: 0 });
  const [editingUserId, setEditingUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token] = useState(localStorage.getItem('token'));
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/admin/cms-users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ email: inviteEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to send invite');
      alert('Invitation sent successfully!');
      setInviteEmail('');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteCmsUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this CMS user?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/admin/cms-users/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.msg || 'Failed to delete CMS user');
        }
        alert('CMS user removed successfully');
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/plans');
      if (res.ok) {
        const data = await res.json();
        setAvailablePlans(data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/users/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.msg || 'Failed to delete user');
        }
        alert('User deleted successfully');
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/users', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch users.`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        calculateMetrics(data);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error occurred while loading users.');
    } finally {
      setLoading(false);
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
      role: user.role,
      activePlans: [...(user.activePlans || [])]
    });
    setShowEditModal(true);
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editData)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || `HTTP ${res.status}: Failed to update user.`);
      }
      setEditingUserId(null);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update user.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">User Management</h1>
      
      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchUsers()} className="btn btn-secondary" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {/* Metrics */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Users size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Users</h3>
            {loading ? (
              <div className="skeleton" style={{ height: '30px', width: '60px', marginTop: '4px' }}></div>
            ) : (
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{metrics.total}</p>
            )}
          </div>
        </div>
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <UserCheck size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Active Subscribers</h3>
            {loading ? (
              <div className="skeleton" style={{ height: '30px', width: '60px', marginTop: '4px' }}></div>
            ) : (
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{metrics.activePlans}</p>
            )}
          </div>
        </div>
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ShieldAlert size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Admins</h3>
            {loading ? (
              <div className="skeleton" style={{ height: '30px', width: '60px', marginTop: '4px' }}></div>
            ) : (
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{metrics.admins}</p>
            )}
          </div>
        </div>
        {userRole === 'superAdmin' && (
        <div className="glass metric-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', border: '1px solid var(--accent-primary)' }} onClick={() => setShowInviteModal(true)}>
          <ShieldAlert size={32} className="gradient-text" />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>CMS Users</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage / Invite</p>
          </div>
        </div>
        )}
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
              {userRole === 'superAdmin' && <th style={{ padding: '12px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '80px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '120px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '180px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '100px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '60px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '80px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '40px' }}></div></td>
                </tr>
              ))
            ) : (
              users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user._id}</td>
                  <td style={{ padding: '12px' }}>{user.username}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>{user.mobile || '-'}</td>
                  <td style={{ padding: '12px' }}><span className="badge">{user.role}</span></td>
                  <td style={{ padding: '12px' }}>
                    {user.activePlans && user.activePlans.length > 0 ? (
                      user.activePlans.map((p, i) => <span key={i} className="badge">{p.planName}</span>)
                    ) : '-'}
                  </td>
                  {userRole === 'superAdmin' && (
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => handleEditClick(user)}><Edit2 size={18} /></button>
                      {user._id !== currentUserId && (
                        <button className="icon-btn delete" onClick={() => handleDeleteUser(user._id)}><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              ))
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '0' }}>
                  <div className="empty-state">
                    <Users size={48} className="empty-state-icon" />
                    <p style={{ fontWeight: '500', fontSize: '1.1rem', marginBottom: '8px' }}>No Users Found</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>There are no registered users in the database currently.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content glass animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Manage CMS Users</h2>
              <button onClick={() => setShowInviteModal(false)} className="icon-btn"><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Invite New Admin</h3>
              <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="admin@example.com" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={inviteLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {inviteLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                  Send Invite
                </button>
              </form>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>They will receive a temporary password valid for 24 hours.</p>
            </div>

            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Current CMS Users</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Role</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => ['admin', 'superAdmin'].includes(u.role)).map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px' }}>
                        {u.mustChangePassword && <span style={{ fontSize: '0.7rem', backgroundColor: '#f39c12', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: 'bold' }}>Pending</span>}
                        {u.email}
                      </td>
                      <td style={{ padding: '10px' }}><span className="badge">{u.role}</span></td>
                      <td style={{ padding: '10px' }}>
                        {u._id !== currentUserId && (
                          <button className="icon-btn delete" onClick={() => handleDeleteCmsUser(u._id)}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUserId && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditingUserId(null); }}>
          <div className="modal-content glass animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Edit User</h2>
              <button onClick={() => { setShowEditModal(false); setEditingUserId(null); }} className="icon-btn"><X size={24} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editingUserId); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Username</label>
                  <input className="form-control" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</label>
                  <input type="email" className="form-control" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} required />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mobile</label>
                  <input className="form-control" value={editData.mobile} onChange={e => setEditData({...editData, mobile: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Role</label>
                  <select className="form-control" value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} disabled={users.find(u => u._id === editingUserId)?.role === 'superAdmin'}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {users.find(u => u._id === editingUserId)?.role === 'superAdmin' && <option value="superAdmin">Super Admin</option>}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Plans</label>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                    {editData.activePlans.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active plans.</span>}
                    {editData.activePlans.map((p, i) => (
                      <span key={i} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '0.9rem' }}>
                        {p.planName}
                        <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => {
                          const newPlans = [...editData.activePlans];
                          newPlans.splice(i, 1);
                          setEditData({...editData, activePlans: newPlans});
                        }}/>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select id="modal-plan-select" className="form-control" style={{ flex: 1 }}>
                      <option value="">Select Plan to Add...</option>
                      {availablePlans.map(plan => (
                        <option key={plan._id} value={plan._id}>{plan.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={(e) => {
                      e.preventDefault();
                      const selectEl = document.getElementById('modal-plan-select');
                      const selectedPlanId = selectEl.value;
                      if (selectedPlanId) {
                        const planDetails = availablePlans.find(p => p._id === selectedPlanId);
                        if (planDetails && !editData.activePlans.find(p => p.planId === planDetails._id)) {
                          setEditData({
                            ...editData,
                            activePlans: [...editData.activePlans, { planId: planDetails._id, planName: planDetails.name, expiryDate: new Date(Date.now() + planDetails.durationInDays * 24 * 60 * 60 * 1000) }]
                          });
                        }
                      }
                    }}>
                      <Plus size={18} /> Add
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditingUserId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


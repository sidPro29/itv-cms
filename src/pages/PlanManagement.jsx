import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Search, X, AlertTriangle } from 'lucide-react';
import { getUserRole } from '../utils/auth';

export default function PlanManagement() {
  const userRole = getUserRole();
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialForm = { name: '', amount: '', type: 'regular', benefits: [''] };
  const [formData, setFormData] = useState(initialForm);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/plans', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch subscription plans.`);
      }
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error occurred while loading plans.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        benefits: formData.benefits.filter(b => b.trim() !== '')
      };

      const url = editId ? `${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/plans/${editId}` : (import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/plans';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to save plan: ${errData.msg || 'Unknown error'}`);
        return;
      }

      setFormData(initialForm);
      setEditId(null);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Network error occurred while saving plan.');
    }
  };

  const handleEdit = (plan) => {
    setEditId(plan._id);
    setFormData({
      name: plan.name,
      amount: plan.amount,
      type: plan.type,
      benefits: plan.benefits && plan.benefits.length > 0 ? plan.benefits : ['']
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData(initialForm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan? This will be permanently deleted.')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/plans/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          throw new Error('Failed to delete plan.');
        }
        fetchPlans();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Error deleting plan.');
      }
    }
  };

  const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <h1 className="page-title">Subscription Plans</h1>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchPlans()} className="btn btn-secondary" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {userRole !== 'admin' && (
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2><PlusCircle size={20} /> {editId ? 'Edit Plan' : 'Create New Plan'}</h2>
          {editId && <button onClick={cancelEdit} className="btn btn-secondary"><X size={16} /> Cancel</button>}
        </div>

        <form onSubmit={handleSubmit} className="cms-form">
          <div className="form-row">
            <input type="text" placeholder="Plan Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input type="number" placeholder="Amount (USD)" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="regular">Regular</option>
              <option value="adsPlan">Ads Plan</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Plan Benefits</label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <input type="text" placeholder={`Benefit ${index + 1}`} value={benefit} onChange={(e) => {
                  const newB = [...formData.benefits];
                  newB[index] = e.target.value;
                  setFormData({ ...formData, benefits: newB });
                }} required={index === 0} />

                {index === formData.benefits.length - 1 ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })}>
                    + Add
                  </button>
                ) : (
                  <button type="button" className="icon-btn delete" onClick={() => {
                    const newB = formData.benefits.filter((_, i) => i !== index);
                    setFormData({ ...formData, benefits: newB });
                  }}>
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="primary-btn">{editId ? 'Update Plan' : 'Save Plan'}</button>
        </form>
      </div>
      )}

      <div className="glass table-container" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>All Plans</h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '250px' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Benefits</th>
              {userRole !== 'admin' && <th style={{ padding: '12px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '150px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '60px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '80px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '120px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '40px' }}></div></td>
                </tr>
              ))
            ) : (
              filteredPlans.map(plan => (
                <tr key={plan._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{plan.name}</td>
                  <td style={{ padding: '12px', color: 'var(--success)' }}>${plan.amount}</td>
                  <td style={{ padding: '12px' }}><span className="plan-type">{plan.type}</span></td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {plan.benefits.length} benefits listed
                  </td>
                  {userRole !== 'admin' && (
                  <td style={{ padding: '12px' }}>
                    <button className="icon-btn" onClick={() => handleEdit(plan)}><Edit2 size={18} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(plan._id)}><Trash2 size={18} /></button>
                  </td>
                  )}
                </tr>
              ))
            )}
            {!loading && filteredPlans.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '0' }}>
                  <div className="empty-state">
                    <PlusCircle size={48} className="empty-state-icon" />
                    <p style={{ fontWeight: '500', fontSize: '1.1rem', marginBottom: '8px' }}>No Plans Found</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>There are no subscription plans configured in the system.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

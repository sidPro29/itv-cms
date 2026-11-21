import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Search, X, AlertTriangle, Sparkles, Tv, Megaphone, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { getUserRole } from '../utils/auth';

export default function PlanManagement() {
  const userRole = getUserRole();
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all' | 'viewer' | 'adsPlan' | 'community'
  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialForm = { 
    name: '', 
    amount: '', 
    billingCycle: 'Monthly', 
    type: 'regular', 
    category: 'viewer',
    tagline: '',
    benefits: [''] 
  };
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
        amount: Number(formData.amount),
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
      setShowFormModal(false);
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
      billingCycle: plan.billingCycle || 'Monthly',
      type: plan.type || 'regular',
      category: plan.category || (plan.type === 'adsPlan' ? 'creator' : plan.type === 'community' ? 'community' : 'viewer'),
      tagline: plan.tagline || plan.description || '',
      benefits: plan.benefits && plan.benefits.length > 0 ? plan.benefits : ['']
    });
    setShowFormModal(true);
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData(initialForm);
    setShowFormModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/plans/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to delete plan: ${errData.msg || 'Unknown error'}`);
        return;
      }
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Network error occurred while deleting plan.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredPlans.length) return;

    const currentItem = filteredPlans[index];
    const targetItem = filteredPlans[targetIndex];

    const newPlans = [...plans];
    const currentIndexInAll = newPlans.findIndex(p => p._id === currentItem._id);
    const targetIndexInAll = newPlans.findIndex(p => p._id === targetItem._id);

    if (currentIndexInAll === -1 || targetIndexInAll === -1) return;

    // Swap positions
    const temp = newPlans[currentIndexInAll];
    newPlans[currentIndexInAll] = newPlans[targetIndexInAll];
    newPlans[targetIndexInAll] = temp;

    setPlans(newPlans);

    try {
      const orderedIds = newPlans.map(p => p._id);
      await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/plans/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      console.error('Failed to save plan reorder:', err);
      fetchPlans();
    }
  };

  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.type && p.type.toLowerCase().includes(search.toLowerCase())) ||
                          (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (platformFilter === 'all') return true;
    if (platformFilter === 'viewer') return p.type === 'regular' || p.category === 'viewer';
    if (platformFilter === 'adsPlan') return p.type === 'adsPlan' || ['creator', 'smallBusiness', 'corporate'].includes(p.category);
    if (platformFilter === 'community') return p.type === 'community' || p.category === 'community' || p.name.toLowerCase().includes('space');
    return true;
  });

  const getPlatformBadge = (plan) => {
    if (plan.type === 'community' || plan.category === 'community' || plan.name.toLowerCase().includes('space')) {
      return <span className="badge" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)', padding: '4px 10px', borderRadius: '12px' }}><Users size={12} style={{ marginRight: '4px' }} /> Space Community</span>;
    }
    if (plan.type === 'adsPlan' || ['creator', 'smallBusiness', 'corporate'].includes(plan.category)) {
      return <span className="badge" style={{ background: 'rgba(255, 170, 0, 0.15)', color: '#ffb822', border: '1px solid rgba(255,170,0,0.3)', padding: '4px 10px', borderRadius: '12px' }}><Megaphone size={12} style={{ marginRight: '4px' }} /> Advertising (B2B)</span>;
    }
    return <span className="badge" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)', padding: '4px 10px', borderRadius: '12px' }}><Tv size={12} style={{ marginRight: '4px' }} /> Streaming (Viewer)</span>;
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Subscription & Advertising Plans</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            Manage plans for interplanetary.tv (Streaming & B2B Ads) and community.interplanetary.tv (Space Community Tiers).
          </p>
        </div>
        {userRole !== 'admin' && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditId(null); setFormData(initialForm); setShowFormModal(true); }}>
            <PlusCircle size={18} /> Create New Plan
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchPlans()} className="btn btn-secondary" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {userRole !== 'admin' && showFormModal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content glass animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: '640px', maxWidth: '92vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{editId ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={cancelEdit} className="icon-btn"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="cms-form">
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="Plan Name (e.g. Navigator (Standard HD))" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Amount (EUR)" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-row">
                <select value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly (10x Monthly)</option>
                </select>

                {/* Target Platform Flag */}
                <select 
                  value={formData.type} 
                  onChange={(e) => {
                    const newType = e.target.value;
                    let defaultCat = 'viewer';
                    if (newType === 'adsPlan') defaultCat = 'creator';
                    if (newType === 'community') defaultCat = 'community';
                    setFormData({ ...formData, type: newType, category: defaultCat });
                  }}
                >
                  <option value="regular">📺 Streaming (Viewer)</option>
                  <option value="adsPlan">💼 Commercial Advertising (B2B)</option>
                  <option value="community">🚀 Space Community Tier</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Tagline / Short description (e.g. Crisp high-definition streaming for true space enthusiasts)" 
                  value={formData.tagline} 
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Plan Benefits (Checklist items)</label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <input 
                      type="text" 
                      placeholder={`Feature ${index + 1}`} 
                      value={benefit} 
                      onChange={(e) => {
                        const newB = [...formData.benefits];
                        newB[index] = e.target.value;
                        setFormData({ ...formData, benefits: newB });
                      }} 
                      required={index === 0} 
                    />

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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Plan' : 'Save Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plans Table with Platform Filters */}
      <div className="glass table-container" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Segment Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${platformFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              onClick={() => setPlatformFilter('all')}
            >
              All Plans ({plans.length})
            </button>
            <button 
              className={`btn ${platformFilter === 'viewer' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              onClick={() => setPlatformFilter('viewer')}
            >
              <Tv size={14} style={{ marginRight: '6px' }} /> Streaming Viewers
            </button>
            <button 
              className={`btn ${platformFilter === 'adsPlan' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              onClick={() => setPlatformFilter('adsPlan')}
            >
              <Megaphone size={14} style={{ marginRight: '6px' }} /> Advertising (B2B)
            </button>
            <button 
              className={`btn ${platformFilter === 'community' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              onClick={() => setPlatformFilter('community')}
            >
              <Users size={14} style={{ marginRight: '6px' }} /> Space Community
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '220px' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px', width: '80px' }}>Slide</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Cycle</th>
              <th style={{ padding: '12px' }}>Platform / Target</th>
              <th style={{ padding: '12px' }}>Benefits</th>
              {userRole !== 'admin' && <th style={{ padding: '12px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '50px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '150px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '60px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '60px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '120px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '100px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '40px' }}></div></td>
                </tr>
              ))
            ) : (
              filteredPlans.map((plan, index) => (
                <tr key={plan._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        className="icon-btn" 
                        disabled={index === 0} 
                        onClick={() => handleMove(index, 'up')} 
                        title="Slide Up"
                        style={{ opacity: index === 0 ? 0.25 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '4px' }}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        className="icon-btn" 
                        disabled={index === filteredPlans.length - 1} 
                        onClick={() => handleMove(index, 'down')} 
                        title="Slide Down"
                        style={{ opacity: index === filteredPlans.length - 1 ? 0.25 : 1, cursor: index === filteredPlans.length - 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    <div>{plan.name}</div>
                    {plan.tagline && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{plan.tagline}</div>}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--success)', fontWeight: 700 }}>€{plan.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {plan.billingCycle || 'Monthly'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {getPlatformBadge(plan)}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {plan.benefits?.length || 0} features
                  </td>
                  {userRole !== 'admin' && (
                    <td style={{ padding: '12px' }}>
                      <button className="icon-btn" onClick={() => handleEdit(plan)} title="Edit Plan"><Edit2 size={18} /></button>
                      <button className="icon-btn delete" onClick={() => handleDelete(plan._id)} title="Delete Plan"><Trash2 size={18} /></button>
                    </td>
                  )}
                </tr>
              ))
            )}
            {!loading && filteredPlans.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No plans found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

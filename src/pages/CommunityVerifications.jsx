import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, Search, Filter, ExternalLink, CheckCircle2, Clock, FileText, AlertTriangle, Eye, Award } from 'lucide-react';

export default function CommunityVerifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignBadge, setAssignBadge] = useState('enthusiast');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/admin/community/verifications?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const handleOpenInspectModal = (user) => {
    setSelectedUser(user);
    setAssignBadge(user.verificationBadge !== 'none' ? user.verificationBadge : (user.communityProfile?.category || 'enthusiast'));
    setAdminNotes(user.verificationNotes || '');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedUser) return;
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/admin/community/verifications/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          verificationStatus: newStatus,
          verificationBadge: assignBadge,
          notes: adminNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Update failed');

      alert(`User verification updated to ${newStatus}`);
      setSelectedUser(null);
      fetchVerifications();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const q = searchTerm.toLowerCase();
    const name = (r.username || r.communityProfile?.fullName || '').toLowerCase();
    const email = (r.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div style={{ padding: '30px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--accent-primary, #007aff)' }} /> Community Verifications Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review legal identification documents, LinkedIn profiles, and career credentials to grant verification badges.
          </p>
        </div>
      </div>

      {/* Controls Bar: Filters & Search */}
      <div className="glass" style={{ padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'verified', label: 'Verified Members' },
            { id: 'rejected', label: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'gray' }} />
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading verifications...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '12px', color: 'var(--text-secondary)' }}>
          No verification requests found in this category.
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px' }}>User</th>
                <th style={{ padding: '14px 20px' }}>Requested Category</th>
                <th style={{ padding: '14px 20px' }}>Submitted Legal ID</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.communityProfile?.fullName || user.username || user.email.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge" style={{ textTransform: 'capitalize' }}>
                      🚀 {user.communityProfile?.category || 'Enthusiast'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div>{user.verificationDocs?.docType || 'ID Document'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Name: {user.verificationDocs?.legalName || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${user.verificationStatus === 'verified' ? 'badge-success' : user.verificationStatus === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {user.verificationStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleOpenInspectModal(user)}>
                      <Eye size={14} /> Review & Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass" style={{ width: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', borderRadius: '16px', background: 'var(--bg-card, #12182d)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                Review Verification for {selectedUser.communityProfile?.fullName || selectedUser.email}
              </h3>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setSelectedUser(null)}>
                <XCircle size={24} />
              </button>
            </div>

            {/* Legal Document Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                📄 Submitted Legal Identification Document
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                <div><strong>Document Type:</strong> {selectedUser.verificationDocs?.docType || 'N/A'}</div>
                <div><strong>Legal Name:</strong> {selectedUser.verificationDocs?.legalName || 'N/A'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Physical Address:</strong> {selectedUser.verificationDocs?.address || 'N/A'}</div>
              </div>
              {selectedUser.verificationDocs?.idDocumentUrl && (
                <div style={{ marginTop: '12px' }}>
                  <a href={selectedUser.verificationDocs.idDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={14} /> Open ID Document File / Image
                  </a>
                </div>
              )}
            </div>

            {/* LinkedIn & External Links */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                🔗 LinkedIn & Professional Profiles
              </h4>
              <p style={{ fontSize: '0.88rem' }}>
                <strong>LinkedIn:</strong> {selectedUser.communityProfile?.linkedinUrl ? (
                  <a href={selectedUser.communityProfile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#007aff' }}>
                    {selectedUser.communityProfile.linkedinUrl} <ExternalLink size={12} style={{ display: 'inline' }} />
                  </a>
                ) : 'Not provided'}
              </p>
            </div>

            {/* Admin Decision Controls */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Assign Verification Badge *</label>
                <select className="form-select" value={assignBadge} onChange={(e) => setAssignBadge(e.target.value)}>
                  <option value="enthusiast">Space Enthusiast 🚀</option>
                  <option value="professional">Space Professional 🧑‍🚀</option>
                  <option value="entrepreneur">Space Entrepreneur 💼</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Admin Review Notes / Rejection Reason</label>
                <textarea className="form-textarea" rows={2} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Notes for user..." />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-danger" onClick={() => handleUpdateStatus('rejected')} disabled={processing}>
                  Reject Request
                </button>
                <button className="btn btn-success" onClick={() => handleUpdateStatus('verified')} disabled={processing}>
                  <CheckCircle2 size={16} /> Approve & Grant Badge
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

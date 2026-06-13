import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Download, Calendar, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [planFilter, setPlanFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // 'all', 'today', 'week', 'month'

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/admin/purchases`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const data = await res.json();
      setPurchases(data);
    } catch (err) {
      console.error(err);
      setError('Could not load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const downloadInvoice = (purchase) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('iTV - Interplanetary TV', 14, 20);
    
    doc.setFontSize(16);
    doc.text('Purchase Receipt', 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Receipt ID: ${purchase._id}`, 14, 40);
    doc.text(`Date: ${new Date(purchase.purchaseDate).toLocaleString()}`, 14, 45);
    
    // Customer Info
    doc.setFontSize(12);
    doc.text('Customer Details:', 14, 60);
    doc.setFontSize(10);
    doc.text(`Username: ${purchase.userId?.username || 'N/A'}`, 14, 66);
    doc.text(`Email: ${purchase.userId?.email || 'N/A'}`, 14, 71);

    // Plan Info
    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Amount']],
      body: [
        [
          `Subscription to ${purchase.planId?.name || 'Unknown Plan'}`,
          `${purchase.amount} ${purchase.currency.toUpperCase()}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 122, 255] }
    });
    
    const finalY = doc.lastAutoTable?.finalY || 85;
    
    doc.setFontSize(12);
    doc.text(`Total Paid: ${purchase.amount} ${purchase.currency.toUpperCase()}`, 14, finalY + 15);
    doc.text(`Status: ${purchase.status.toUpperCase()}`, 14, finalY + 22);
    
    doc.setFontSize(10);
    doc.text('Thank you for subscribing to Interplanetary.tv!', 14, finalY + 40);

    doc.save(`receipt_${purchase._id}.pdf`);
  };

  const filteredPurchases = purchases.filter(p => {
    // Filter by plan
    if (planFilter && p.planId?.name !== planFilter) {
      return false;
    }
    // Filter by date
    if (dateFilter && dateFilter !== 'all') {
      const pDate = new Date(p.purchaseDate);
      const now = new Date();
      if (dateFilter === 'today') {
        if (pDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        if (pDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        if (pDate < monthAgo) return false;
      }
    }
    return true;
  });

  // Unique plans for filter dropdown
  const uniquePlans = [...new Set(purchases.map(p => p.planId?.name).filter(Boolean))];

  return (
    <div className="animate-fade-in page-container">
      <header className="page-header">
        <div>
          <h1>Purchases & Transactions</h1>
          <p>View, filter, and download user subscription records.</p>
        </div>
      </header>

      <div className="table-controls glass" style={{ padding: '20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              className="form-control" 
              style={{ paddingLeft: '44px', cursor: 'pointer', appearance: 'none' }}
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="">All Plans</option>
              {uniquePlans.map((plan, i) => (
                <option key={i} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              className="form-control" 
              style={{ paddingLeft: '44px', cursor: 'pointer', appearance: 'none' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ margin: '20px 0' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={fetchPurchases} className="btn btn-secondary">Retry</button>
        </div>
      )}

      <div className="glass table-container" style={{ marginTop: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 10px auto' }} />
            <p>Loading transactions...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <CreditCard size={48} style={{ opacity: 0.2, margin: '0 auto 10px auto' }} />
            <p>No purchases found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Plan</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{p.userId?.username || 'Unknown'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.userId?.email || 'N/A'}</span>
                    </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ background: 'var(--accent-secondary)', color: 'white', padding: '4px 12px', display: 'inline-block', maxWidth: '200px', whiteSpace: 'normal', lineHeight: '1.2' }}>
                        {p.planId?.name || 'Unknown Plan'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{p.amount} {p.currency.toUpperCase()}</td>
                    <td style={{ padding: '12px' }}>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ background: p.status === 'succeeded' ? 'var(--success)' : 'var(--danger)', color: 'white', padding: '4px 12px' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button className="btn btn-secondary" onClick={() => downloadInvoice(p)} title="Download PDF Receipt" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        <Download size={16} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;

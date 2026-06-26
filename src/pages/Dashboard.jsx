import React, { useState, useEffect } from 'react';
import { Users, Film, Tv, Video, Newspaper, DollarSign, Activity, AlertTriangle, CreditCard, Settings, Shield, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    subscribers: 0,
    wpVideos: 0,
    movies: 0,
    videos: 0,
    tvshows: 0,
    episodes: 0,
    articles: 0,
    revenue: 0,
    subscriberGrowth: []
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  // Logs modal state
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [modalLogs, setModalLogs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 15;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, mediaRes, articlesRes, logsRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/admin/stats', { headers: { 'x-auth-token': token } }),
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/media-assets', { headers: { 'x-auth-token': token } }),
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/articles', { headers: { 'x-auth-token': token } }),
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/logs?limit=10', { headers: { 'x-auth-token': token } })
      ]);

      if (!statsRes.ok || !mediaRes.ok || !articlesRes.ok || !logsRes.ok) {
        throw new Error('Failed to fetch dashboard metrics from server endpoints.');
      }

      const [stats, media, articles, logsData] = await Promise.all([
        statsRes.json(),
        mediaRes.json(),
        articlesRes.json(),
        logsRes.json()
      ]);

      setStatsData({
        subscribers: stats.totalSubscribers || 0,
        movies: stats.contentDistribution?.totalMovies || 0,
        videos: stats.contentDistribution?.totalVideos || 0,
        tvshows: stats.contentDistribution?.totalShows || 0,
        episodes: stats.contentDistribution?.totalEpisodes || 0,
        articles: articles.length,
        revenue: stats.totalRevenue || 0,
        subscriberGrowth: stats.subscriberGrowth || []
      });

      setRecentActivity(logsData.logs || []);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchModalLogs = async () => {
    if (!showLogsModal) return;
    setModalLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/logs?limit=${limit}&skip=${skip}`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setModalLogs(data.logs || []);
        setTotalLogs(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    fetchModalLogs();
  }, [skip, showLogsModal]);

  const stats = [
    { title: 'Total Subscribers', value: statsData.subscribers, icon: <Users size={24} />, change: '+12% vs last month', positive: true, desc: 'Registered accounts' },
    { title: 'Total Movies', value: statsData.movies, icon: <Film size={24} />, change: '+5% vs last month', positive: true, desc: 'Full length movies' },
    { title: 'Total TV Shows', value: statsData.tvshows, icon: <Tv size={24} />, change: '+2% vs last month', positive: true, desc: 'Series and shows' },
    { title: 'Total Videos', value: statsData.videos, icon: <Video size={24} />, change: '+25% vs last month', positive: true, desc: 'Short clips and videos' },
    { title: 'Total Episodes', value: statsData.episodes, icon: <Tv size={24} />, change: '+10% vs last month', positive: true, desc: 'Episodes' },
    { title: 'Total Revenue', value: `$${statsData.revenue.toLocaleString()}`, icon: <DollarSign size={24} />, change: '+15% vs last month', positive: true, desc: 'Total sales volume' },
  ];

  const contentDistributionData = [
    { name: 'Movies', count: statsData.movies },
    { name: 'TV Shows', count: statsData.tvshows },
    { name: 'Videos', count: statsData.videos },
    { name: 'Episodes', count: statsData.episodes },
    { name: 'Articles', count: statsData.articles },
  ];

  const userGrowthData = statsData.subscriberGrowth.length > 0 ? statsData.subscriberGrowth : [
    { name: 'Jan', count: 0 },
    { name: 'Feb', count: 0 }
  ];

  const renderLogIcon = (collection) => {
    switch (collection) {
      case 'MediaAsset': return <Film size={20} />;
      case 'Article': return <Newspaper size={20} />;
      case 'User': return <Users size={20} />;
      case 'Plan': return <CreditCard size={20} />;
      case 'Page': return <Settings size={20} />;
      default: return <Shield size={20} />;
    }
  };

  const getActionStyles = (action) => {
    switch (action) {
      case 'CREATE': return { background: 'rgba(48, 209, 88, 0.15)', color: '#30d158' };
      case 'UPDATE': return { background: 'rgba(0, 122, 255, 0.15)', color: '#007aff' };
      case 'DELETE': return { background: 'rgba(255, 59, 48, 0.15)', color: '#ff3b30' };
      default: return { background: 'rgba(175, 82, 222, 0.15)', color: '#af52de' }; // LOGIN
    }
  };

  return (
    <div className="animate-fade-in page-container" style={{ padding: 0 }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your OTT & News Management Command Center.</p>
      </header>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {loading ? (
          [...Array(6)].map((_, index) => (
            <div key={index} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ height: '16px', width: '100px' }}></div>
                <div className="skeleton" style={{ height: '24px', width: '24px', borderRadius: '4px' }}></div>
              </div>
              <div>
                <div className="skeleton" style={{ height: '40px', width: '120px', margin: '8px 0' }}></div>
                <div className="skeleton" style={{ height: '14px', width: '140px' }}></div>
                <div className="skeleton" style={{ height: '12px', width: '110px', marginTop: '8px' }}></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>{stat.title}</span>
                <div style={{ color: 'var(--accent-primary)' }}>{stat.icon}</div>
              </div>
              <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0' }}>{stat.value}</h2>
                <p style={{ fontSize: '0.85rem', color: stat.positive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {stat.change}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {stat.desc}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {/* Content Distribution Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Content Distribution</h3>
          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: '8px' }}></div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Subscriber Growth Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Subscriber Growth (Last 6 Months)</h3>
          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: '8px' }}></div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  <Line type="monotone" dataKey="count" stroke="var(--accent-secondary)" strokeWidth={3} dot={{ fill: 'var(--accent-secondary)', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass" style={{ padding: '24px', borderRadius: '12px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} className="gradient-text" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Recent Activity Log</h3>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => { setSkip(0); setShowLogsModal(true); }}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            View More
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="skeleton skeleton-avatar" style={{ borderRadius: '10px' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: '18px', width: '40%', marginBottom: '6px' }}></div>
                  <div className="skeleton" style={{ height: '12px', width: '25%' }}></div>
                </div>
                <div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '12px' }}></div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((log) => {
              const actStyle = getActionStyles(log.action);
              return (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--bg-tertiary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    {renderLogIcon(log.collectionName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>{log.details}</h4>
                      <span className="badge" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem', padding: '2px 6px', background: actStyle.background, color: actStyle.color }}>
                        {log.action}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Performed by <strong style={{ color: 'var(--text-primary)' }}>{log.username}</strong> on {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="badge" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{log.collectionName}</span>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px 0', margin: 0 }}>No recent activity found. Start editing content!</p>
          )}
        </div>
      </div>

      {/* LIVE AUDIT LOG MODAL */}
      {showLogsModal && (
        <div className="modal-overlay" onClick={() => setShowLogsModal(false)}>
          <div className="modal-content glass animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: '950px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={24} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ margin: 0 }}>System Audit Logs</h2>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="icon-btn"><X size={24} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
              {modalLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                  <Activity className="spinner" size={44} style={{ color: 'var(--accent-primary)', marginBottom: '10px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Loading audit logs...</p>
                </div>
              ) : modalLogs.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>User</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Action</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Module</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Details</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalLogs.map(log => {
                      const actStyle = getActionStyles(log.action);
                      return (
                        <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{log.username}</td>
                          <td style={{ padding: '12px' }}>
                            <span className="badge" style={{ 
                              textTransform: 'uppercase', 
                              fontSize: '0.72rem', 
                              padding: '3px 8px', 
                              background: actStyle.background,
                              color: actStyle.color
                            }}>{log.action}</span>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{log.collectionName}</td>
                          <td style={{ padding: '12px' }}>{log.details}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No logs recorded yet.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {totalLogs === 0 ? 0 : skip + 1} to {Math.min(skip + limit, totalLogs)} of {totalLogs} entries
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={skip === 0 || modalLoading} 
                  onClick={() => setSkip(prev => Math.max(0, prev - limit))}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px' }}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  disabled={skip + limit >= totalLogs || modalLoading} 
                  onClick={() => setSkip(prev => prev + limit)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px' }}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

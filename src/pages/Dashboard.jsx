import React, { useState, useEffect } from 'react';
import { Users, Film, Tv, Video, Newspaper, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    subscribers: 0,
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, mediaRes, articlesRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/admin/stats', { headers: { 'x-auth-token': token } }),
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/media-assets', { headers: { 'x-auth-token': token } }),
        fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/articles', { headers: { 'x-auth-token': token } })
      ]);

      if (!statsRes.ok || !mediaRes.ok || !articlesRes.ok) {
        throw new Error('Failed to fetch dashboard metrics from one or more server endpoints.');
      }

      const [stats, media, articles] = await Promise.all([
        statsRes.json(),
        mediaRes.json(),
        articlesRes.json()
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

      // Combine media and articles for recent activity (take top 6)
      const combined = [
        ...media.map(m => ({ ...m, category: m.type })),
        ...articles.map(a => ({ ...a, category: 'article' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

      setRecentActivity(combined);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

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
      <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Activity size={24} className="gradient-text" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Activity</h3>
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
            recentActivity.map((item) => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-tertiary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  {item.category === 'article' 
                    ? <Newspaper size={20} /> 
                    : (item.category === 'tvshow' || item.category === 'tvshows') 
                      ? <Tv size={20} /> 
                      : (item.category === 'video' || item.category === 'videos') 
                        ? <Video size={20} /> 
                        : <Film size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Added on {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="badge" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px 0' }}>No recent activity found. Start adding content!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


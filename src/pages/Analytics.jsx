import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, MessageSquare, Users, CreditCard, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/admin/stats`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Failed to fetch analytics data');
      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error(err);
      setError('Could not load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={fetchAnalytics} className="btn btn-secondary">Retry</button>
        </div>
      </div>
    );
  }

  if (!statsData) return null;

  const topStats = [
    { title: 'Total Views', value: statsData.totalViews.toLocaleString(), icon: <Eye size={24} />, color: '#007aff' },
    { title: 'Total Likes', value: statsData.totalLikes.toLocaleString(), icon: <ThumbsUp size={24} />, color: '#34c759' },
    { title: 'Total Comments', value: statsData.totalComments.toLocaleString(), icon: <MessageSquare size={24} />, color: '#ff9500' },
    { title: 'Total Subscribers', value: statsData.totalSubscribers.toLocaleString(), icon: <Users size={24} />, color: '#bf5af2' },
    { title: 'Plans Purchased', value: statsData.totalPurchases.toLocaleString(), icon: <CreditCard size={24} />, color: '#ff2d55' },
    { title: 'Total Revenue', value: `$${statsData.totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#30d158' },
  ];

  // Colors for Pie Chart
  const COLORS = ['#007aff', '#34c759', '#ff9500', '#ff2d55', '#bf5af2'];

  const contentDist = Object.keys(statsData.contentDistribution).map(key => ({
    name: key.replace('total', ''),
    value: statsData.contentDistribution[key]
  })).filter(item => item.value > 0);

  const interactionDist = [
    { name: 'Views', value: statsData.totalViews },
    { name: 'Likes', value: statsData.totalLikes },
    { name: 'Comments', value: statsData.totalComments }
  ].filter(item => item.value > 0);

  // If both are 0, just mock it so the pie chart isn't empty
  if (interactionDist.length === 0) {
    interactionDist.push({ name: 'No Data', value: 1 });
  }

  const mediaVsNewsDist = [
    { name: 'Media Views', value: statsData.totalMediaViews || 0 },
    { name: 'News Views', value: statsData.totalArticleViews || 0 }
  ].filter(item => item.value > 0);

  if (mediaVsNewsDist.length === 0) {
    mediaVsNewsDist.push({ name: 'No Data', value: 1 });
  }

  return (
    <div className="animate-fade-in page-container">
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Deep Analysis</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Comprehensive overview of user engagement, content performance, and revenue.</p>
      </header>

      {/* Top Meta Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {topStats.map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '12px', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ padding: '15px', borderRadius: '50%', background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>{stat.title}</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Engagement Breakdown Pie Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>Overall Engagement (Views, Likes, Comments)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interactionDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {interactionDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Media vs News Pie Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>Media vs News Engagement (Views)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mediaVsNewsDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#007aff" />
                  <Cell fill="#bf5af2" />
                  <Cell fill="#34c759" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution Bar Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>Content Library Distribution</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentDist} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" name="Count" fill="#bf5af2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;

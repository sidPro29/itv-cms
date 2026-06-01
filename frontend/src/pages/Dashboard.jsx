import React, { useState, useEffect } from 'react';
import { Users, Film, Tv, Video, Newspaper, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    users: 0,
    movies: 0,
    videos: 0,
    tvshows: 0,
    articles: 0,
    revenue: 45200 // Hardcoded until Stripe is integrated
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, mediaRes, articlesRes] = await Promise.all([
          fetch('http://localhost:5000/api/users', { headers: { 'x-auth-token': token } }),
          fetch('http://localhost:5000/api/media-assets', { headers: { 'x-auth-token': token } }),
          fetch('http://localhost:5000/api/articles', { headers: { 'x-auth-token': token } })
        ]);

        let users = [], media = [], articles = [];
        if (usersRes.ok) users = await usersRes.json();
        if (mediaRes.ok) media = await mediaRes.json();
        if (articlesRes.ok) articles = await articlesRes.json();

                const movies = media.filter(m => m.type === 'movie' || m.type === 'movies').length;
        const videos = media.filter(m => m.type === 'video' || m.type === 'videos').length;
        const tvshows = media.filter(m => m.type === 'tvshow' || m.type === 'tvshows').length;

        setStatsData({
          users: users.length,
          movies,
          videos,
          tvshows,
          articles: articles.length,
          revenue: 45200
        });

        // Combine media and articles for recent activity (take top 6)
        const combined = [
          ...media.map(m => ({ ...m, category: m.type })),
          ...articles.map(a => ({ ...a, category: 'article' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

        setRecentActivity(combined);

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  const stats = [
    { title: 'Total Users', value: statsData.users, icon: <Users size={24} />, change: '+12% vs last month', positive: true, desc: 'Registered accounts' },
    { title: 'Total Movies', value: statsData.movies, icon: <Film size={24} />, change: '+5% vs last month', positive: true, desc: 'Full length movies' },
    { title: 'Total TV Shows', value: statsData.tvshows, icon: <Tv size={24} />, change: '+2% vs last month', positive: true, desc: 'Series and shows' },
    { title: 'Total Videos', value: statsData.videos, icon: <Video size={24} />, change: '+25% vs last month', positive: true, desc: 'Short clips and videos' },
    { title: 'News Articles', value: statsData.articles, icon: <Newspaper size={24} />, change: '+18% vs last month', positive: true, desc: 'Published articles' },
    { title: 'Total Revenue', value: `$${statsData.revenue.toLocaleString()}`, icon: <DollarSign size={24} />, change: '-2% vs last month', positive: false, desc: 'Monthly recurring revenue' },
  ];

  const contentDistributionData = [
    { name: 'Movies', count: statsData.movies },
    { name: 'TV Shows', count: statsData.tvshows },
    { name: 'Videos', count: statsData.videos },
    { name: 'Articles', count: statsData.articles },
  ];

  const userGrowthData = [
    { month: 'Jan', users: Math.floor(statsData.users * 0.2) },
    { month: 'Feb', users: Math.floor(statsData.users * 0.4) },
    { month: 'Mar', users: Math.floor(statsData.users * 0.6) },
    { month: 'Apr', users: Math.floor(statsData.users * 0.75) },
    { month: 'May', users: Math.floor(statsData.users * 0.9) },
    { month: 'Jun', users: statsData.users || 1 },
  ];

  return (
    <div className="animate-fade-in page-container" style={{ padding: 0 }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your OTT & News Management Command Center.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat, index) => (
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
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>

        {/* Content Distribution Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Content Distribution</h3>
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
        </div>

        {/* User Growth Chart */}
        <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>User Growth (Last 6 Months)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="users" stroke="var(--accent-secondary)" strokeWidth={3} dot={{ fill: 'var(--accent-secondary)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Activity size={24} className="gradient-text" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Activity</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recentActivity.length > 0 ? recentActivity.map((item) => (
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
          )) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px 0' }}>No recent activity found. Start adding content!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

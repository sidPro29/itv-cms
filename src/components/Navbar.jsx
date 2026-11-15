import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, FileText, Tag, Users, LogOut, Sun, Moon, CreditCard, BarChart2, Image, FileEdit, ShieldCheck } from 'lucide-react';
import { getUserProfile } from '../utils/auth';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const userProfile = getUserProfile();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="sidebar glass">
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px', padding: '6px 0' }}>
        <img src="/logo.png" alt="ITV Logo" style={{ maxWidth: '44px', height: 'auto', objectFit: 'contain' }} />
        <h2 className="gradient-text" style={{ fontSize: '1.35rem', margin: 0 }}>iTV CMS</h2>
      </div>
      <ul className="sidebar-links">
        <li>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/media" className={`nav-link ${isActive('/media')}`}>
            <Film size={17} />
            <span>Media Assets</span>
          </Link>
        </li>
        <li>
          <Link to="/library" className={`nav-link ${isActive('/library')}`}>
            <Image size={17} />
            <span>Image Library</span>
          </Link>
        </li>
        <li>
          <Link to="/articles" className={`nav-link ${isActive('/articles')}`}>
            <FileText size={17} />
            <span>Articles</span>
          </Link>
        </li>
        <li>
          <Link to="/plans" className={`nav-link ${isActive('/plans')}`}>
            <Tag size={17} />
            <span>Plans</span>
          </Link>
        </li>
        <li>
          <Link to="/users" className={`nav-link ${isActive('/users')}`}>
            <Users size={17} />
            <span>Users</span>
          </Link>
        </li>
        <li>
          <Link to="/purchases" className={`nav-link ${isActive('/purchases')}`}>
            <CreditCard size={17} />
            <span>Purchases</span>
          </Link>
        </li>
        <li>
          <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>
            <BarChart2 size={17} />
            <span>Analysis</span>
          </Link>
        </li>
        <li>
          <Link to="/edit-pages" className={`nav-link ${isActive('/edit-pages')}`}>
            <FileEdit size={17} />
            <span>Edit Pages</span>
          </Link>
        </li>
        <li>
          <Link to="/community-verifications" className={`nav-link ${isActive('/community-verifications')}`}>
            <ShieldCheck size={17} />
            <span>Community Verifications</span>
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {userProfile && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile.username || 'Admin'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile.email || 're-login to sync'}
              </div>
              <span className="badge" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>{userProfile.role}</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={toggleTheme} style={{ flex: 1, padding: '7px', fontSize: '0.82rem' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ flex: 2, padding: '7px 10px', fontSize: '0.82rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

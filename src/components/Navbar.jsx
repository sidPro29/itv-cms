import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, FileText, Tag, Users, LogOut, Sun, Moon, CreditCard, BarChart2 } from 'lucide-react';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px', padding: '10px 0' }}>
        <img src="/logo.png" alt="ITV Logo" style={{ maxWidth: '60px', height: 'auto', objectFit: 'contain' }} />
        <h2 className="gradient-text" style={{ fontSize: '1.6rem', margin: 0 }}>iTV CMS</h2>
      </div>
      <ul className="sidebar-links">
        <li>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/media" className={`nav-link ${isActive('/media')}`}>
            <Film size={20} />
            <span>Media Assets</span>
          </Link>
        </li>
        <li>
          <Link to="/articles" className={`nav-link ${isActive('/articles')}`}>
            <FileText size={20} />
            <span>Articles</span>
          </Link>
        </li>
        <li>
          <Link to="/plans" className={`nav-link ${isActive('/plans')}`}>
            <Tag size={20} />
            <span>Plans</span>
          </Link>
        </li>
        <li>
          <Link to="/users" className={`nav-link ${isActive('/users')}`}>
            <Users size={20} />
            <span>Users</span>
          </Link>
        </li>
        <li>
          <Link to="/purchases" className={`nav-link ${isActive('/purchases')}`}>
            <CreditCard size={20} />
            <span>Purchases</span>
          </Link>
        </li>
        <li>
          <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>
            <BarChart2 size={20} />
            <span>Analysis</span>
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer" style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={toggleTheme} style={{ flex: 1, padding: '10px' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ flex: 2 }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

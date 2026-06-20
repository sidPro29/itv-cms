import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

import Login from './pages/Login';
import ForcePasswordChange from './pages/ForcePasswordChange';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MediaManagement from './pages/MediaManagement';
import ArticleManagement from './pages/ArticleManagement';
import PlanManagement from './pages/PlanManagement';
import UserManagement from './pages/UserManagement';
import Purchases from './pages/Purchases';
import Analytics from './pages/Analytics';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (has token)
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        <div className={isAuthenticated ? "main-content" : ""}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/force-password-change" element={<ForcePasswordChange setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute isAuthenticated={isAuthenticated}><Dashboard /></PrivateRoute>} />
            <Route path="/media" element={<PrivateRoute isAuthenticated={isAuthenticated}><MediaManagement /></PrivateRoute>} />
            <Route path="/articles" element={<PrivateRoute isAuthenticated={isAuthenticated}><ArticleManagement /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute isAuthenticated={isAuthenticated}><PlanManagement /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute isAuthenticated={isAuthenticated}><UserManagement /></PrivateRoute>} />
            <Route path="/purchases" element={<PrivateRoute isAuthenticated={isAuthenticated}><Purchases /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute isAuthenticated={isAuthenticated}><Analytics /></PrivateRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

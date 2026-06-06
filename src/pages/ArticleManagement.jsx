import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Search, X, AlertTriangle, Newspaper } from 'lucide-react';

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const initialForm = { title: '', subtitle: '', description: '', imageUrl: '', videoUrl: '', keywords: [''] };
  const [formData, setFormData] = useState(initialForm);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/articles', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch articles.`);
      }
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error occurred while loading articles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.filter(k => k.trim() !== '')
      };
      
      const url = editId ? `${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/articles/${editId}` : (import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/articles';
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
        alert(`Failed to save article: ${errData.msg || 'Unknown error'}`);
        return;
      }
      
      setFormData(initialForm);
      setEditId(null);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Network error occurred while saving article.');
    }
  };

  const handleEdit = (article) => {
    setEditId(article._id);
    setFormData({
      title: article.title,
      subtitle: article.subtitle || '',
      description: article.description,
      imageUrl: article.imageUrl || '',
      videoUrl: article.videoUrl || '',
      keywords: article.keywords && article.keywords.length > 0 ? article.keywords : ['']
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData(initialForm);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this article?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/articles/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          throw new Error('Failed to delete article.');
        }
        fetchArticles();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Error deleting article.');
      }
    }
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <h1 className="page-title">Articles & News</h1>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchArticles()} className="btn btn-secondary" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}
      
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2><PlusCircle size={20} /> {editId ? 'Edit Article' : 'Draft New Article'}</h2>
          {editId && <button onClick={cancelEdit} className="btn btn-secondary"><X size={16}/> Cancel</button>}
        </div>
        
        <form onSubmit={handleSubmit} className="cms-form">
          <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <input type="text" placeholder="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
          
          <div className="form-row">
            <input type="text" placeholder="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
            <input type="text" placeholder="Video URL" value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} />
          </div>

          <textarea placeholder="Article Content / Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="5" />
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Keywords</label>
            {formData.keywords.map((keyword, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <input type="text" placeholder={`Keyword ${index + 1}`} value={keyword} onChange={(e) => {
                  const newK = [...formData.keywords];
                  newK[index] = e.target.value;
                  setFormData({...formData, keywords: newK});
                }} />
                
                {index === formData.keywords.length - 1 ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, keywords: [...formData.keywords, '']})}>
                    + Add
                  </button>
                ) : (
                  <button type="button" className="icon-btn delete" onClick={() => {
                    const newK = formData.keywords.filter((_, i) => i !== index);
                    setFormData({...formData, keywords: newK});
                  }}>
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button type="submit" className="primary-btn">{editId ? 'Update Article' : 'Publish Article'}</button>
        </form>
      </div>

      <div className="glass table-container" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>All Articles</h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="form-control" 
              style={{ paddingLeft: '36px', width: '250px' }} 
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Keywords</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '220px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '100px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '80px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '40px' }}></div></td>
                </tr>
              ))
            ) : (
              filteredArticles.map(article => (
                <tr key={article._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{article.title}</td>
                  <td style={{ padding: '12px' }}>
                    {article.keywords?.slice(0,2).map((k,i) => <span key={i} className="badge">{k}</span>)}
                    {article.keywords?.length > 2 && <span className="badge">+{article.keywords.length - 2}</span>}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="icon-btn" onClick={() => handleEdit(article)}><Edit2 size={18} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(article._id)}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
            {!loading && filteredArticles.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '0' }}>
                  <div className="empty-state">
                    <Newspaper size={48} className="empty-state-icon" />
                    <p style={{ fontWeight: '500', fontSize: '1.1rem', marginBottom: '8px' }}>No Articles Found</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>There are no articles or news drafts in the database currently.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Search, X } from 'lucide-react';

export default function MediaManagement() {
  const [assets, setAssets] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [editId, setEditId] = useState(null);
  
  const initialForm = { title: '', subtitle: '', description: '', type: 'movie', videoUrl: '', trailerUrl: '', languages: [''], images: [''], programId: '', programName: '', membership_level: [], genres: [''], tags: [''] };
  const [formData, setFormData] = useState(initialForm);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchAssets();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/plans', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/media-assets', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        languages: formData.languages.filter(l => l.trim() !== ''),
        images: formData.images.filter(i => i.trim() !== ''),
        genres: formData.genres.filter(g => g.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
        membership_level: formData.membership_level,
        program: formData.type === 'episode' && formData.programId ? {
          programId: formData.programId,
          programName: formData.programName
        } : undefined
      };
      
      const url = editId ? `http://localhost:5000/api/media-assets/${editId}` : 'http://localhost:5000/api/media-assets';
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
        alert(`Failed to save media: ${errData.msg || 'Unknown error'}`);
        return;
      }
      
      setFormData(initialForm);
      setEditId(null);
      fetchAssets();
    } catch (err) {
      console.error(err);
      alert('Network error occurred while saving media.');
    }
  };

  const handleEdit = (asset) => {
    setEditId(asset._id);
    setFormData({
      title: asset.title,
      subtitle: asset.subtitle || '',
      description: asset.description,
      type: asset.type,
      videoUrl: asset.videoUrl || '',
      trailerUrl: asset.trailerUrl || '',
      languages: asset.languages && asset.languages.length > 0 ? asset.languages : [''],
      images: asset.images && asset.images.length > 0 ? asset.images : [''],
      genres: asset.genres && asset.genres.length > 0 ? asset.genres : [''],
      tags: asset.tags && asset.tags.length > 0 ? asset.tags : [''],
      membership_level: asset.membership_level || [],
      programId: asset.program?.programId || '',
      programName: asset.program?.programName || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData(initialForm);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this media asset?')) {
      try {
        await fetch(`http://localhost:5000/api/media-assets/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        fetchAssets();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    if (selectedType === 'all') return matchesSearch;
    if (selectedType === 'movie') {
      return matchesSearch && (a.type === 'movie' || a.type === 'movies');
    }
    if (selectedType === 'tvshow') {
      return matchesSearch && (a.type === 'tvshow' || a.type === 'tvshows');
    }
    if (selectedType === 'video') {
      return matchesSearch && (a.type === 'video' || a.type === 'videos');
    }
    return matchesSearch && a.type === selectedType;
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Media Assets</h1>
      
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2><PlusCircle size={20} /> {editId ? 'Edit Media Asset' : 'Add New Media'}</h2>
          {editId && <button onClick={cancelEdit} className="btn btn-secondary"><X size={16}/> Cancel</button>}
        </div>
        
        <form onSubmit={handleSubmit} className="cms-form">
          <div className="form-row">
            <select value={formData.type === 'movies' ? 'movie' : formData.type === 'tvshows' ? 'tvshow' : formData.type === 'videos' ? 'video' : formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="movie">Movie</option>
              <option value="tvshow">TV Show</option>
              <option value="episode">Episode</option>
              <option value="video">Video</option>
            </select>
            <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            <input type="text" placeholder="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
          </div>

          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required style={{ height: '70px', minHeight: '70px' }} />
          
          {formData.type === 'episode' && (
            <div className="form-row">
              <select value={formData.programId} onChange={(e) => {
                const selectedShow = assets.find(a => a._id === e.target.value);
                setFormData({
                  ...formData, 
                  programId: e.target.value,
                  programName: selectedShow ? selectedShow.title : ''
                });
              }} required style={{ margin: 0 }}>
                <option value="">Select a Program this Episode belongs to...</option>
                {assets.map(show => (
                  <option key={show._id} value={show._id}>{show.title} ({show.type})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <input type="text" placeholder="Video URL" value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} />
            <input type="text" placeholder="Trailer URL" value={formData.trailerUrl} onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})} />
          </div>

          <div className="form-row" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Languages</label>
              {formData.languages.map((lang, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input type="text" placeholder={`Language ${index + 1}`} value={lang} onChange={(e) => {
                    const newL = [...formData.languages];
                    newL[index] = e.target.value;
                    setFormData({...formData, languages: newL});
                  }} style={{ margin: 0 }} />
                  
                  {index === formData.languages.length - 1 ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, languages: [...formData.languages, '']})} style={{ padding: '0 15px', height: '42px' }}>
                      + Add
                    </button>
                  ) : (
                    <button type="button" className="icon-btn delete" onClick={() => {
                      const newL = formData.languages.filter((_, i) => i !== index);
                      setFormData({...formData, languages: newL});
                    }} style={{ height: '42px' }}>
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Image URLs</label>
              {formData.images.map((img, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input type="text" placeholder={`Image URL ${index + 1}`} value={img} onChange={(e) => {
                    const newI = [...formData.images];
                    newI[index] = e.target.value;
                    setFormData({...formData, images: newI});
                  }} style={{ margin: 0 }} />
                  
                  {index === formData.images.length - 1 ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, images: [...formData.images, '']})} style={{ padding: '0 15px', height: '42px' }}>
                      + Add
                    </button>
                  ) : (
                    <button type="button" className="icon-btn delete" onClick={() => {
                      const newI = formData.images.filter((_, i) => i !== index);
                      setFormData({...formData, images: newI});
                    }} style={{ height: '42px' }}>
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-row" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Genres</label>
              {formData.genres.map((genre, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input type="text" placeholder={`Genre ${index + 1}`} value={genre} onChange={(e) => {
                    const newG = [...formData.genres];
                    newG[index] = e.target.value;
                    setFormData({...formData, genres: newG});
                  }} style={{ margin: 0 }} />
                  
                  {index === formData.genres.length - 1 ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, genres: [...formData.genres, '']})} style={{ padding: '0 15px', height: '42px' }}>
                      + Add
                    </button>
                  ) : (
                    <button type="button" className="icon-btn delete" onClick={() => {
                      const newG = formData.genres.filter((_, i) => i !== index);
                      setFormData({...formData, genres: newG});
                    }} style={{ height: '42px' }}>
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tags</label>
              {formData.tags.map((tag, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input type="text" placeholder={`Tag ${index + 1}`} value={tag} onChange={(e) => {
                    const newT = [...formData.tags];
                    newT[index] = e.target.value;
                    setFormData({...formData, tags: newT});
                  }} style={{ margin: 0 }} />
                  
                  {index === formData.tags.length - 1 ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, tags: [...formData.tags, '']})} style={{ padding: '0 15px', height: '42px' }}>
                      + Add
                    </button>
                  ) : (
                    <button type="button" className="icon-btn delete" onClick={() => {
                      const newT = formData.tags.filter((_, i) => i !== index);
                      setFormData({...formData, tags: newT});
                    }} style={{ height: '42px' }}>
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Membership Level (Required Plans)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {plans.map(plan => {
                const isSelected = formData.membership_level.some(m => m.planId === plan._id);
                return (
                  <button
                    key={plan._id}
                    type="button"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          membership_level: formData.membership_level.filter(m => m.planId !== plan._id)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          membership_level: [...formData.membership_level, { planId: plan._id, planName: plan.name }]
                        });
                      }
                    }}
                  >
                    {plan.name}
                  </button>
                )
              })}
              {plans.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No plans available.</span>}
            </div>
          </div>

          <button type="submit" className="primary-btn">{editId ? 'Update Media' : 'Save Media'}</button>
        </form>
      </div>

      <div className="glass table-container" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>All Media Assets</h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Type Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              {['all', 'movie', 'tvshow', 'episode', 'video'].map(type => {
                const getLabel = (t) => {
                  switch(t) {
                    case 'all': return 'All';
                    case 'movie': return 'Movies';
                    case 'tvshow': return 'TV Shows';
                    case 'episode': return 'Episodes';
                    case 'video': return 'Videos';
                    default: return t;
                  }
                };
                const isActive = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: 'none',
                      background: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {getLabel(type)}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search media..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="form-control" 
                style={{ paddingLeft: '36px', width: '200px', margin: 0 }} 
              />
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Program Info</th>
              <th style={{ padding: '12px' }}>Membership</th>
              <th style={{ padding: '12px' }}>Languages</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{asset.title}</td>
                <td style={{ padding: '12px' }}><span className="badge" style={{textTransform: 'uppercase'}}>{asset.type}</span></td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {asset.type === 'episode' && asset.program?.programName ? asset.program.programName : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  {asset.membership_level && asset.membership_level.length > 0 
                    ? asset.membership_level.map((m, i) => <span key={i} className="badge" style={{background: 'var(--accent-primary)', color: 'white'}}>{m.planName}</span>)
                    : <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Free</span>}
                </td>
                <td style={{ padding: '12px' }}>
                  {asset.languages?.slice(0,2).map((l,i) => <span key={i} className="badge">{l}</span>)}
                </td>
                <td style={{ padding: '12px' }}>
                  <button className="icon-btn" onClick={() => handleEdit(asset)}><Edit2 size={18} /></button>
                  <button className="icon-btn delete" onClick={() => handleDelete(asset._id)}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No media assets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Search, X, AlertTriangle, Film, Tv, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { getUserRole } from '../utils/auth';
import ImageSelectorModal from '../components/ImageSelectorModal';

export default function MediaManagement() {
  const userRole = getUserRole();
  const [assets, setAssets] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for chips input text box
  const [langInput, setLangInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // States for parent program searchable dropdown
  const [programSearch, setProgramSearch] = useState('');
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  // States for Image Upload and Selection
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);

  const initialForm = { title: '', subtitle: '', rating: '', description: '', type: 'movie', languages: [], images: [''], programId: '', programName: '', membership_level: [], genres: [], tags: [] };
  // New UI state for video/trailer handling
  const [videoMethod, setVideoMethod] = useState('url'); // 'upload' | 'url' | 'clipId'
  const [videoInput, setVideoInput] = useState(''); // file object or string
  const [trailerMethod, setTrailerMethod] = useState('url');
  const [trailerInput, setTrailerInput] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchAssets();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/plans', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/media-assets', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch media assets.`);
      }
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error occurred while loading media assets.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    
    try {
      setUploadingImageIndex(index);
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api';
      const res = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formDataObj });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.success) {
        const newI = [...formData.images];
        newI[index] = data.url;
        setFormData({ ...formData, images: newI });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploadingImageIndex(null);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build the videos and trailer objects based on selected method
      const buildAssetObject = (method, input, svpRefNo) => {
        const obj = {};
        if (svpRefNo && svpRefNo.trim()) obj.svpRefNo = svpRefNo.trim();

        if (method === 'upload') {
          // file upload – clipId will come back from SVP API (placeholder for now)
          obj.clipId = input?.name || null;
        } else if (method === 'url') {
          const isYouTube = typeof input === 'string' && /(?:youtube\.com|youtu\.be)/i.test(input);
          if (isYouTube) { obj.youtube = input; }
          else if (input && input.trim()) { obj['non-svp'] = input.trim(); }
        } else if (method === 'clipId') {
          if (input && input.trim()) obj.clipId = input.trim();
        }
        return obj;
      };

      const videoObj = buildAssetObject(formData.videoMethod || 'url', formData.videoInput, formData.videoSvpRefNo);
      const trailerObj = buildAssetObject(formData.trailerMethod || 'url', formData.trailerInput, formData.trailerSvpRefNo);

      const payload = {
        ...formData,
        // Remove old legacy fields
        videoUrl: undefined,
        trailerUrl: undefined,
        svp_clip_id: undefined,
        svp_ref_no: undefined,
        // New structured fields
        videos: videoObj,
        trailer: trailerObj,
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

      const url = editId ? `${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/media-assets/${editId}` : (import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/media-assets';
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
      setLangInput('');
      setGenreInput('');
      setTagInput('');
      setShowFormModal(false);
      fetchAssets();
    } catch (err) {
      console.error(err);
      alert('Network error occurred while saving media.');
    }
  };

  const handleEdit = (asset) => {
    setEditId(asset._id);
    setFormData({
      title: asset.title || '',
      subtitle: asset.subtitle || '',
      rating: asset.rating || '',
      description: asset.description,
      type: asset.type,
      languages: asset.languages && asset.languages.length > 0 ? asset.languages : [],
      images: asset.images && asset.images.length > 0 ? asset.images : [''],
      genres: asset.genres && asset.genres.length > 0 ? asset.genres : [],
      tags: asset.tags && asset.tags.length > 0 ? asset.tags : [],
      membership_level: asset.membership_level || [],
      programId: asset.program?.programId || '',
      programName: asset.program?.programName || '',
      videoMethod: 'url',
      videoInput: '',
      trailerMethod: 'url',
      trailerInput: ''
    });
    setLangInput('');
    setGenreInput('');
    setTagInput('');
    setShowFormModal(true);
  };
  const cancelEdit = () => {
    setEditId(null);
    setFormData(initialForm);
    setLangInput('');
    setGenreInput('');
    setTagInput('');
    setShowFormModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this media asset? This will be permanently deleted.')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}/media-assets/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          throw new Error('Failed to delete media asset.');
        }
        fetchAssets();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Error deleting media asset.');
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

  const tvShowsList = assets.filter(a => a.type === 'tvshow' || a.type === 'tvshows');

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Media Assets</h1>
        {userRole !== 'admin' && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditId(null); setFormData(initialForm); setShowFormModal(true); }}>
            <PlusCircle size={18} /> Add New Media
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchAssets()} className="btn btn-secondary" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {userRole !== 'admin' && showFormModal && (
      <div className="modal-overlay" onClick={cancelEdit}>
        <div className="modal-content glass animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{editId ? 'Edit Media Asset' : 'Add New Media'}</h2>
            <button onClick={cancelEdit} className="icon-btn"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="cms-form">
            {/* Video – method selector + input + svpRefNo in one row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: '50px' }}>Video</label>
              <select
                value={formData.videoMethod || 'url'}
                onChange={(e) => setFormData({ ...formData, videoMethod: e.target.value, videoInput: '' })}
                style={{ flex: '0 0 160px', margin: 0 }}
              >
                <option value="upload">Upload (SVP)</option>
                <option value="url">Video URL</option>
                <option value="clipId">SVP Clip ID</option>
              </select>
              {formData.videoMethod === 'upload' && (
                <input type="file" accept="video/*" style={{ flex: 1, margin: 0 }}
                  onChange={(e) => setFormData({ ...formData, videoInput: e.target.files[0] })} />
              )}
              {formData.videoMethod === 'url' && (
                <input type="text" placeholder="Paste video URL…" value={formData.videoInput || ''} style={{ flex: 1, margin: 0 }}
                  onChange={(e) => setFormData({ ...formData, videoInput: e.target.value })} />
              )}
              {formData.videoMethod === 'clipId' && (
                <input type="text" placeholder="SVP Clip ID" value={formData.videoInput || ''} style={{ flex: 1, margin: 0 }}
                  onChange={(e) => setFormData({ ...formData, videoInput: e.target.value })} />
              )}
              <input type="text" placeholder="SVP Ref No (optional)" value={formData.videoSvpRefNo || ''} style={{ flex: '0 0 180px', margin: 0, fontSize: '0.85rem' }}
                onChange={(e) => setFormData({ ...formData, videoSvpRefNo: e.target.value })} />
            </div>

            {/* Trailer – method selector + input + svpRefNo in one row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: '50px' }}>Trailer</label>
              <select
                value={formData.trailerMethod || 'url'}
                onChange={(e) => setFormData({ ...formData, trailerMethod: e.target.value, trailerInput: '' })}
                style={{ flex: '0 0 160px', margin: 0 }}
              >
                <option value="upload">Upload (SVP)</option>
                <option value="url">Trailer URL</option>
                <option value="clipId">SVP Clip ID</option>
              </select>
              {formData.trailerMethod === 'upload' && (
                <input type="file" accept="video/*" style={{ flex: 1, margin: 0 }}
                  onChange={(e) => setFormData({ ...formData, trailerInput: e.target.files[0] })} />
              )}
              {formData.trailerMethod === 'url' && (
                <input type="text" placeholder="Paste trailer URL…" value={formData.trailerInput || ''} style={{ flex: 1, margin: 0 }}
                  onChange={(e) => setFormData({ ...formData, trailerInput: e.target.value })} />
              )}
              {formData.trailerMethod === 'clipId' && (
                <input type="text" placeholder="SVP Clip ID" value={formData.trailerInput || ''} style={{ flex: 1, margin: 0 }}
                  onChange={(e) => setFormData({ ...formData, trailerInput: e.target.value })} />
              )}
              <input type="text" placeholder="SVP Ref No (optional)" value={formData.trailerSvpRefNo || ''} style={{ flex: '0 0 180px', margin: 0, fontSize: '0.85rem' }}
                onChange={(e) => setFormData({ ...formData, trailerSvpRefNo: e.target.value })} />
            </div>

            <div className="form-row">
              <select value={formData.type === 'movies' ? 'movie' : formData.type === 'tvshows' ? 'tvshow' : formData.type === 'videos' ? 'video' : formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="movie">Movie</option>
                <option value="tvshow">TV Show</option>
                <option value="episode">Episode</option>
                <option value="video">Video</option>
              </select>
              <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <input type="text" placeholder="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              <input type="text" placeholder="Rating (e.g. 3+ U/A)" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
            </div>

            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required style={{ height: '70px', minHeight: '70px' }} />

            {formData.type === 'episode' && (
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Parent TV Show Program</label>
                <div style={{ marginTop: '8px' }}>
                  <div
                    className="form-control"
                    onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-tertiary)'
                    }}
                  >
                    <span>{formData.programName || "Select a TV Show..."}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>▼</span>
                  </div>

                  {showProgramDropdown && (
                    <div
                      className="glass"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        marginTop: '4px',
                        padding: '12px',
                        boxShadow: 'var(--shadow-lg)',
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search TV Shows..."
                        value={programSearch}
                        onChange={(e) => setProgramSearch(e.target.value)}
                        className="dropdown-search-input"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            transition: 'background 0.25s'
                          }}
                          onClick={() => {
                            setFormData({ ...formData, programId: '', programName: '' });
                            setShowProgramDropdown(false);
                            setProgramSearch('');
                          }}
                        >
                          -- Clear Selection --
                        </div>
                        {tvShowsList
                          .filter(show => show.title.toLowerCase().includes(programSearch.toLowerCase()))
                          .map(show => (
                            <div
                              key={show._id}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                background: formData.programId === show._id ? 'var(--accent-primary)' : 'transparent',
                                color: formData.programId === show._id ? 'white' : 'var(--text-primary)',
                                transition: 'background 0.25s'
                              }}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  programId: show._id,
                                  programName: show.title
                                });
                                setShowProgramDropdown(false);
                                setProgramSearch('');
                              }}
                            >
                              {show.title}
                            </div>
                          ))
                        }
                        {tvShowsList.filter(show => show.title.toLowerCase().includes(programSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No TV Shows found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}



            <div className="form-row" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
              {/* Languages Chips UI */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Languages</label>
                <div className="chips-input-container" style={{ marginTop: '8px' }}>
                  {formData.languages.map((lang, index) => (
                    <span key={index} className="chip">
                      {lang}
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => {
                          const newL = formData.languages.filter((_, i) => i !== index);
                          setFormData({ ...formData, languages: newL });
                        }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={formData.languages.length === 0 ? "Type language & press Enter" : ""}
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (langInput.trim()) {
                          if (!formData.languages.includes(langInput.trim())) {
                            setFormData({ ...formData, languages: [...formData.languages, langInput.trim()] });
                          }
                          setLangInput('');
                        }
                      }
                    }}
                    className="chips-input"
                  />
                  {langInput.trim() && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (!formData.languages.includes(langInput.trim())) {
                          setFormData({ ...formData, languages: [...formData.languages, langInput.trim()] });
                        }
                        setLangInput('');
                      }}
                      style={{ padding: '2px 8px', height: '28px', fontSize: '0.8rem', borderRadius: '4px' }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {/* Images Input URLs */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Image URLs</label>
                {formData.images.map((img, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input type="text" placeholder={`Image URL ${index + 1}`} value={img} onChange={(e) => {
                      const newI = [...formData.images];
                      newI[index] = e.target.value;
                      setFormData({ ...formData, images: newI });
                    }} style={{ margin: 0, flex: 1 }} />

                    <button type="button" className="icon-btn" title="Choose from Library" onClick={() => { setActiveImageIndex(index); setShowLibraryModal(true); }} style={{ background: 'var(--bg-tertiary)', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-color)', height: '42px' }}>
                      <ImageIcon size={18} />
                    </button>

                    <label className="icon-btn" title="Upload from PC" style={{ background: 'var(--bg-tertiary)', padding: '0 10px', borderRadius: '6px', border: '1px solid var(--border-color)', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {uploadingImageIndex === index ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, index)} disabled={uploadingImageIndex === index} />
                    </label>

                    {index === formData.images.length - 1 ? (
                      <button type="button" className="btn btn-secondary" onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })} style={{ padding: '0 15px', height: '42px' }}>
                        + Add
                      </button>
                    ) : (
                      <button type="button" className="icon-btn delete" onClick={() => {
                        const newI = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newI });
                      }} style={{ height: '42px' }}>
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
              {/* Genres Chips UI */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Genres</label>
                <div className="chips-input-container" style={{ marginTop: '8px' }}>
                  {formData.genres.map((genre, index) => (
                    <span key={index} className="chip">
                      {genre}
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => {
                          const newG = formData.genres.filter((_, i) => i !== index);
                          setFormData({ ...formData, genres: newG });
                        }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={formData.genres.length === 0 ? "Type genre & press Enter" : ""}
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (genreInput.trim()) {
                          if (!formData.genres.includes(genreInput.trim())) {
                            setFormData({ ...formData, genres: [...formData.genres, genreInput.trim()] });
                          }
                          setGenreInput('');
                        }
                      }
                    }}
                    className="chips-input"
                  />
                  {genreInput.trim() && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (!formData.genres.includes(genreInput.trim())) {
                          setFormData({ ...formData, genres: [...formData.genres, genreInput.trim()] });
                        }
                        setGenreInput('');
                      }}
                      style={{ padding: '2px 8px', height: '28px', fontSize: '0.8rem', borderRadius: '4px' }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {/* Tags Chips UI */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tags</label>
                <div className="chips-input-container" style={{ marginTop: '8px' }}>
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="chip">
                      {tag}
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => {
                          const newT = formData.tags.filter((_, i) => i !== index);
                          setFormData({ ...formData, tags: newT });
                        }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={formData.tags.length === 0 ? "Type tag & press Enter" : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          if (!formData.tags.includes(tagInput.trim())) {
                            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
                          }
                          setTagInput('');
                        }
                      }
                    }}
                    className="chips-input"
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (!formData.tags.includes(tagInput.trim())) {
                          setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
                        }
                        setTagInput('');
                      }}
                      style={{ padding: '2px 8px', height: '28px', fontSize: '0.8rem', borderRadius: '4px' }}
                    >
                      + Add
                    </button>
                  )}
                </div>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Update Media' : 'Save Media'}</button>
            </div>
          </form>
          
          <ImageSelectorModal 
            isOpen={showLibraryModal} 
            onClose={() => setShowLibraryModal(false)}
            onSelect={(url) => {
              if (activeImageIndex !== null) {
                const newI = [...formData.images];
                newI[activeImageIndex] = url;
                setFormData({ ...formData, images: newI });
              }
            }}
          />
        </div>
      </div>
      )}

      <div className="glass table-container" style={{ padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>All Media Assets</h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Type Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              {['all', 'movie', 'tvshow', 'episode', 'video'].map(type => {
                const getLabel = (t) => {
                  switch (t) {
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
              <th style={{ padding: '12px', width: '50px' }}>Image</th>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Membership</th>
              <th style={{ padding: '12px' }}>Languages</th>
              {userRole !== 'admin' && <th style={{ padding: '12px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '180px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '80px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '120px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '80px' }}></div></td>
                  <td style={{ padding: '12px' }}><div className="skeleton skeleton-row" style={{ width: '50px' }}></div></td>
                </tr>
              ))
            ) : (
              filteredAssets.map(asset => (
                <tr key={asset._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>
                    {asset.images && asset.images[0] ? (
                      <img src={asset.images[0]} alt="thumbnail" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#111' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={20} color="var(--text-muted)" />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{asset.title}</td>
                  <td style={{ padding: '12px' }}><span className="badge" style={{ textTransform: 'uppercase' }}>{asset.type}</span></td>
                  <td style={{ padding: '12px' }}>
                    {asset.membership_level && asset.membership_level.length > 0
                      ? asset.membership_level.map((m, i) => <span key={i} className="badge" style={{ background: 'var(--accent-primary)', color: 'white' }}>{m.planName}</span>)
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Free</span>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {asset.languages?.slice(0, 2).map((l, i) => <span key={i} className="badge">{l}</span>)}
                  </td>
                  {userRole !== 'admin' && (
                  <td style={{ padding: '12px' }}>
                    <button className="icon-btn" onClick={() => handleEdit(asset)}><Edit2 size={18} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(asset._id)}><Trash2 size={18} /></button>
                  </td>
                  )}
                </tr>
              ))
            )}
            {!loading && filteredAssets.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '0' }}>
                  <div className="empty-state">
                    <Film size={48} className="empty-state-icon" />
                    <p style={{ fontWeight: '500', fontSize: '1.1rem', marginBottom: '8px' }}>No Media Assets Found</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No media matching your filters was found in the database.</p>
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


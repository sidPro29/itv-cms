import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Smartphone, AlertTriangle, UploadCloud } from 'lucide-react';

export default function ManageApks() {
  const [apks, setApks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newApk, setNewApk] = useState({ title: '', imageFile: null, apkFile: null });
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api';

  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    try {
      const origin = new URL(baseUrl).origin;
      return `${origin}${url}`;
    } catch (e) {
      return url;
    }
  };

  useEffect(() => {
    fetchApks();
  }, []);

  const fetchApks = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${baseUrl}/apks`);
      if (!res.ok) throw new Error('Failed to fetch APKs');
      const data = await res.json();
      setApks(data.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not load APKs');
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this APK?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/apks/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Failed to delete APK');
      setApks(apks.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting APK');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newApk.title || !newApk.imageFile || !newApk.apkFile) {
      alert('Please provide title, image, and APK file.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      // 1. Upload Image
      const imageFormData = new FormData();
      imageFormData.append('image', newApk.imageFile);
      const imgRes = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: imageFormData
      });
      if (!imgRes.ok) throw new Error('Image upload failed');
      const imgData = await imgRes.json();
      const imageUrl = imgData.url;

      // 2. Upload APK
      const apkFormData = new FormData();
      apkFormData.append('apk', newApk.apkFile);
      const apkRes = await fetch(`${baseUrl}/upload/apk`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: apkFormData
      });
      if (!apkRes.ok) throw new Error('APK upload failed');
      const apkData = await apkRes.json();
      const apkUrl = apkData.url;

      // 3. Create APK Record
      const recordRes = await fetch(`${baseUrl}/apks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          title: newApk.title,
          imageUrl,
          apkUrl
        })
      });
      if (!recordRes.ok) throw new Error('Failed to create APK record');
      
      // Refresh list
      await fetchApks();
      setShowModal(false);
      setNewApk({ title: '', imageFile: null, apkFile: null });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error uploading APK');
    } finally {
      setUploading(false);
    }
  };

  if (fetching) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="spinner" size={32} /></div>;
  }

  return (
    <div className="cms-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Manage APKs</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add APK
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={20} /> <span>{error}</span>
        </div>
      )}

      {apks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <Smartphone size={40} style={{ color: 'var(--text-secondary)', marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No APKs found. Click Add APK to upload one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {apks.map(apk => (
            <div key={apk._id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <img src={getAbsoluteUrl(apk.imageUrl)} alt={apk.title} style={{ width: '110px', height: '60px', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', marginRight: '20px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{apk.title}</h3>
                <a href={getAbsoluteUrl(apk.apkUrl)} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Download Link
                </a>
              </div>
              <button 
                className="btn" 
                onClick={() => handleDelete(apk._id)}
                disabled={loading}
                style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.2)', padding: '8px 12px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '12px' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Add New App File</h2>
            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Title (e.g. Android TV App / LGTV IPK)</label>
                <input 
                  type="text" 
                  value={newApk.title} 
                  onChange={e => setNewApk({ ...newApk, title: e.target.value })} 
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Icon / Image File</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setNewApk({ ...newApk, imageFile: e.target.files[0] })} 
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', width: '100%', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>App / Package File (APK, IPK, ZIP, etc.)</label>
                <input 
                  type="file" 
                  accept=".apk,.ipk,.zip,application/octet-stream,application/vnd.android.package-archive"
                  onChange={e => setNewApk({ ...newApk, apkFile: e.target.files[0] })} 
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', width: '100%', borderRadius: '4px' }}
                />
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>Max size: 500MB</small>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} disabled={uploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {uploading ? <Loader2 size={16} className="spinner" /> : <UploadCloud size={16} />}
                  <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

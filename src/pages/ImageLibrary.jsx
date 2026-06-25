import React, { useState, useEffect } from 'react';
import { Copy, Upload, Trash2, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import './ImageLibrary.css';

const ImageLibrary = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [error, setError] = useState('');

  const fetchImages = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api';
      const response = await fetch(`${baseUrl}/images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load images from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      setError('');
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api';
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      if (data.success) {
        // Refresh the image list to show the new upload
        fetchImages();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = null;
    }
  };

  const copyToClipboard = (url) => {
    // Determine the absolute URL if necessary, though relative works best
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="image-library-container">
      <div className="library-header">
        <h1>Image Library</h1>
        <p>Manage and view all images uploaded to the server.</p>
        
        {error && <div className="error-alert">{error}</div>}
        
        <div className="library-actions">
          <label className="upload-btn">
            {uploading ? <Loader2 className="spin" size={20} /> : <Upload size={20} />}
            <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="library-loading">
          <Loader2 className="spin" size={40} />
          <p>Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="library-empty">
          <ImageIcon size={64} opacity={0.5} />
          <h3>No images found</h3>
          <p>Upload an image to see it here.</p>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((img, index) => (
            <div key={index} className="image-card">
              <div className="image-preview">
                <img src={img.url} alt={img.name} loading="lazy" />
              </div>
              <div className="image-details">
                <div className="image-name" title={img.name}>{img.name}</div>
                <div className="image-meta">
                  <span>{formatSize(img.size)}</span>
                  <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="image-actions">
                  <button 
                    className={`copy-btn ${copiedUrl === img.url ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(img.url)}
                    title="Copy URL"
                  >
                    {copiedUrl === img.url ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedUrl === img.url ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;

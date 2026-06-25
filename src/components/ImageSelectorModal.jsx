import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import './ImageSelectorModal.css';

const ImageSelectorModal = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredImages(images);
    } else {
      const term = search.toLowerCase();
      setFilteredImages(images.filter(img => img.name.toLowerCase().includes(term)));
    }
  }, [search, images]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/images');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setImages(data.images || []);
      setFilteredImages(data.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="image-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose from Library</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search images by name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="modal-loading">
              <Loader2 className="spin" size={32} />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="modal-empty">
              <ImageIcon size={48} opacity={0.3} />
              <p>No images found.</p>
            </div>
          ) : (
            <div className="selector-grid">
              {filteredImages.map((img, index) => (
                <div 
                  key={index} 
                  className="selector-card"
                  onClick={() => {
                    onSelect(img.url);
                    onClose();
                  }}
                >
                  <img src={img.url} alt={img.name} loading="lazy" />
                  <div className="selector-name">{img.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectorModal;

import React, { useState } from 'react';

function UploadPoster() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a local URL to preview the image
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select an image file first.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('poster', file);

    try {
      // Note: Attach Firebase Auth token in headers in production
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/upload/poster', {
        method: 'POST',
        // Omit Content-Type header so the browser sets it to multipart/form-data with boundary automatically
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Image uploaded. URL: ${data.imageUrl}`);
        setFile(null);
        setPreview(null);
      } else {
        const errData = await response.json();
        setMessage(`Error: ${errData.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Upload Movie Poster</h2>
        
        {message && (
          <p style={{ color: message.includes('Error') || message.includes('Please') ? '#ff4d4d' : '#4BB543', marginBottom: '15px', wordBreak: 'break-all' }}>
            {message}
          </p>
        )}
        
        <form onSubmit={handleUpload} style={styles.form}>
          <div style={styles.uploadBox}>
            <label style={styles.fileLabel}>
              {file ? file.name : "Choose an Image (JPG/PNG)"}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          {preview && (
            <div style={styles.previewContainer}>
              <img src={preview} alt="Poster Preview" style={styles.previewImage} />
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Uploading...' : 'Upload Poster'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: '#16213e', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', textAlign: 'center' },
  title: { color: '#fff', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  uploadBox: { border: '2px dashed #0f3460', padding: '30px', borderRadius: '10px', backgroundColor: '#1a1a2e', cursor: 'pointer' },
  fileLabel: { color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  previewContainer: { marginTop: '10px' },
  previewImage: { width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '5px' },
  button: { padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#e94560', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};

export default UploadPoster;

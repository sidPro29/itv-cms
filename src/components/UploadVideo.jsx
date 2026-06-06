import React, { useState } from 'react';

function UploadVideo() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video', // 'video', 'movie', 'tvshow'
    svp_clip_id: '',
    tags: '',
    genres: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // In a real app, you would attach the Firebase token here:
      // const token = await auth.currentUser.getIdToken();
      // headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          genres: formData.genres.split(',').map(genre => genre.trim())
        })
      });

      if (response.ok) {
        setMessage('Video saved successfully!');
        setFormData({ title: '', description: '', type: 'video', svp_clip_id: '', tags: '', genres: '' });
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
        <h2 style={styles.title}>Add New Video / Movie</h2>
        {message && <p style={{ color: message.includes('Error') ? '#ff4d4d' : '#4BB543', marginBottom: '15px' }}>{message}</p>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="title" placeholder="Video Title" value={formData.title} onChange={handleChange} style={styles.input} required />
          
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{...styles.input, height: '100px'}} required />
          
          <select name="type" value={formData.type} onChange={handleChange} style={styles.input}>
            <option value="video">Short Video</option>
            <option value="movie">Movie</option>
            <option value="tvshow">TV Show</option>
          </select>

          <input type="text" name="svp_clip_id" placeholder="SVP Clip ID (e.g. 8n39b9e52n8k)" value={formData.svp_clip_id} onChange={handleChange} style={styles.input} required />
          
          <input type="text" name="genres" placeholder="Genres (comma separated)" value={formData.genres} onChange={handleChange} style={styles.input} />
          
          <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} style={styles.input} />
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Saving...' : 'Save Video Data'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: '#16213e', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
  title: { color: '#fff', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '5px', border: '1px solid #0f3460', backgroundColor: '#e94560', color: '#fff', outline: 'none' },
  button: { padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#4BB543', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};

export default UploadVideo;

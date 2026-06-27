import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, FileText, Phone, Settings, AlertTriangle, CheckCircle, Sparkles, CreditCard, Play, Tv, Download, Smartphone } from 'lucide-react';
import ManageApks from '../components/ManageApks';

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Play', icon: Play },
  { name: 'Tv', icon: Tv },
  { name: 'Download', icon: Download },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'Mail', icon: Phone }, // Fallbacks/others
  { name: 'Phone', icon: Phone }
];

export default function EditPages() {
  const [activeTab, setActiveTab] = useState('privacy-policy');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Page contents state
  const [privacyPolicy, setPrivacyPolicy] = useState({ title: 'Privacy Policy', content: '' });
  const [termsOfUse, setTermsOfUse] = useState({ title: 'Terms of Use & Service', content: '' });
  const [faq, setFaq] = useState({ title: 'Frequently Asked Questions', content: [] });
  const [contact, setContact] = useState({ title: 'Contact Us', content: { email: '', phone: '', dpoEmail: '', subtitle: '' } });
  const [footer, setFooter] = useState({ title: 'Footer Settings', content: { description: '', copyright: '' } });

  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api';

  useEffect(() => {
    fetchAllPages();
  }, []);

  const fetchAllPages = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/pages`);
      if (!res.ok) throw new Error('Failed to fetch pages config.');
      const pages = await res.json();
      
      pages.forEach(page => {
        if (page.key === 'privacy-policy') {
          setPrivacyPolicy({ title: page.title, content: page.content || '' });
        } else if (page.key === 'terms-of-use') {
          setTermsOfUse({ title: page.title, content: page.content || '' });
        } else if (page.key === 'faq') {
          setFaq({ title: page.title, content: Array.isArray(page.content) ? page.content : [] });
        } else if (page.key === 'contact') {
          setContact({ 
            title: page.title, 
            content: { 
              email: page.content?.email || '', 
              phone: page.content?.phone || '', 
              dpoEmail: page.content?.dpoEmail || '',
              subtitle: page.content?.subtitle || ''
            } 
          });
        } else if (page.key === 'footer') {
          setFooter({ 
            title: page.title, 
            content: { 
              description: page.content?.description || '', 
              copyright: page.content?.copyright || ''
            } 
          });
        }
      });
    } catch (err) {
      console.error(err);
      setError('Error loading page configurations. Please refresh.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (key, payload) => {
    setLoading(true);
    setError(null);
    setSuccessMsg('');
    try {
      const res = await fetch(`${baseUrl}/pages/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Failed to update page settings.');
      }

      setSuccessMsg(`"${payload.title}" updated successfully!`);
      // Clear success message after 4s
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving settings.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ helpers
  const handleAddFaq = () => {
    const updatedContent = [
      ...faq.content,
      { iconName: 'Sparkles', iconColor: '#007aff', question: 'New Question', answer: 'New Answer' }
    ];
    setFaq({ ...faq, content: updatedContent });
  };

  const handleFaqChange = (index, field, value) => {
    const updatedContent = faq.content.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFaq({ ...faq, content: updatedContent });
  };

  const handleDeleteFaq = (index) => {
    const updatedContent = faq.content.filter((_, idx) => idx !== index);
    setFaq({ ...faq, content: updatedContent });
  };

  const handleMoveFaq = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faq.content.length) return;
    
    const updatedContent = [...faq.content];
    const temp = updatedContent[index];
    updatedContent[index] = updatedContent[newIndex];
    updatedContent[newIndex] = temp;
    setFaq({ ...faq, content: updatedContent });
  };

  if (fetching) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="spinner" size={48} style={{ color: 'var(--accent-primary)', marginBottom: '15px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Fetching settings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Edit Pages & Content</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Modify the static layout texts and policy pages visible on the website.</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="success-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', color: '#30d158', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px', alignItems: 'start' }}>
        {/* Navigation Sidebar */}
        <div className="glass" style={{ borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={`nav-link ${activeTab === 'privacy-policy' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('privacy-policy'); setError(null); setSuccessMsg(''); }}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
          >
            <FileText size={18} />
            <span>Privacy Policy</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'terms-of-use' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('terms-of-use'); setError(null); setSuccessMsg(''); }}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
          >
            <FileText size={18} />
            <span>Terms of Use</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('faq'); setError(null); setSuccessMsg(''); }}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
          >
            <HelpCircle size={18} />
            <span>FAQ Page</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('contact'); setError(null); setSuccessMsg(''); }}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
          >
            <Phone size={18} />
            <span>Contact Us</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'footer' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('footer'); setError(null); setSuccessMsg(''); }}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
          >
            <Settings size={18} />
            <span>Footer Settings</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'apks' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('apks'); setError(null); setSuccessMsg(''); }}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
          >
            <Smartphone size={18} />
            <span>Manage APKs</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="glass" style={{ borderRadius: '12px', padding: '30px' }}>
          
          {/* MANAGE APKS */}
          {activeTab === 'apks' && <ManageApks />}

          {/* PRIVACY POLICY EDITOR */}
          {activeTab === 'privacy-policy' && (
            <div className="cms-form">
              <h2 style={{ marginBottom: '10px' }}>Edit Privacy Policy</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Page Title</label>
                <input 
                  type="text" 
                  value={privacyPolicy.title} 
                  onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, title: e.target.value })} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Page Content (Supports HTML tags like &lt;section&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;h2&gt;)</label>
                <textarea 
                  rows={20}
                  value={privacyPolicy.content} 
                  onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, content: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.5' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSave('privacy-policy', privacyPolicy)} 
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}

          {/* TERMS OF USE EDITOR */}
          {activeTab === 'terms-of-use' && (
            <div className="cms-form">
              <h2 style={{ marginBottom: '10px' }}>Edit Terms of Use & Service</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Page Title</label>
                <input 
                  type="text" 
                  value={termsOfUse.title} 
                  onChange={(e) => setTermsOfUse({ ...termsOfUse, title: e.target.value })} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Page Content (Supports HTML tags)</label>
                <textarea 
                  rows={20}
                  value={termsOfUse.content} 
                  onChange={(e) => setTermsOfUse({ ...termsOfUse, content: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.5' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSave('terms-of-use', termsOfUse)} 
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}

          {/* FAQ ACCORDION BUILDER */}
          {activeTab === 'faq' && (
            <div className="cms-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Edit FAQs</h2>
                <button type="button" className="btn btn-secondary" onClick={handleAddFaq} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add Question
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Accordion Page Title</label>
                <input 
                  type="text" 
                  value={faq.title} 
                  onChange={(e) => setFaq({ ...faq, title: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
                {faq.content.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>No FAQs configured yet. Click "Add Question" above.</p>
                ) : (
                  faq.content.map((item, index) => (
                    <div key={index} className="glass" style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>Question #{index + 1}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => handleMoveFaq(index, 'up')} disabled={index === 0} style={{ padding: '6px 10px' }} title="Move Up">
                            <ArrowUp size={14} />
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => handleMoveFaq(index, 'down')} disabled={index === faq.content.length - 1} style={{ padding: '6px 10px' }} title="Move Down">
                            <ArrowDown size={14} />
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => handleDeleteFaq(index)} style={{ padding: '6px 10px', color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.2)' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '150px 100px 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Icon</label>
                          <select value={item.iconName} onChange={(e) => handleFaqChange(index, 'iconName', e.target.value)}>
                            {AVAILABLE_ICONS.map(ic => (
                              <option key={ic.name} value={ic.name}>{ic.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Icon Color</label>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              type="color" 
                              value={item.iconColor || '#007aff'} 
                              onChange={(e) => handleFaqChange(index, 'iconColor', e.target.value)}
                              style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{item.iconColor || '#007aff'}</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Question Text</label>
                          <input 
                            type="text" 
                            value={item.question} 
                            onChange={(e) => handleFaqChange(index, 'question', e.target.value)} 
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Answer Content</label>
                        <textarea 
                          rows={3} 
                          value={item.answer} 
                          onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} 
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => handleSave('faq', faq)} 
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}

          {/* CONTACT INFO EDITOR */}
          {activeTab === 'contact' && (
            <div className="cms-form">
              <h2 style={{ marginBottom: '15px' }}>Edit Contact Details</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Contact Page Title</label>
                <input 
                  type="text" 
                  value={contact.title} 
                  onChange={(e) => setContact({ ...contact, title: e.target.value })} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Contact Tab Subtitle</label>
                <input 
                  type="text" 
                  value={contact.content.subtitle} 
                  onChange={(e) => setContact({ ...contact, content: { ...contact.content, subtitle: e.target.value } })} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Support Email Address</label>
                  <input 
                    type="email" 
                    value={contact.content.email} 
                    onChange={(e) => setContact({ ...contact, content: { ...contact.content, email: e.target.value } })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Contact Phone Number</label>
                  <input 
                    type="text" 
                    value={contact.content.phone} 
                    onChange={(e) => setContact({ ...contact, content: { ...contact.content, phone: e.target.value } })} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data Protection Officer (DPO) Email</label>
                <input 
                  type="email" 
                  value={contact.content.dpoEmail} 
                  onChange={(e) => setContact({ ...contact, content: { ...contact.content, dpoEmail: e.target.value } })} 
                />
              </div>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => handleSave('contact', contact)} 
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}

          {/* FOOTER SETTINGS EDITOR */}
          {activeTab === 'footer' && (
            <div className="cms-form">
              <h2 style={{ marginBottom: '15px' }}>Edit Footer Content</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Footer Brand Description</label>
                <textarea 
                  rows={4}
                  value={footer.content.description} 
                  onChange={(e) => setFooter({ ...footer, content: { ...footer.content, description: e.target.value } })} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Footer Copyright Line</label>
                <input 
                  type="text" 
                  value={footer.content.copyright} 
                  onChange={(e) => setFooter({ ...footer, content: { ...footer.content, copyright: e.target.value } })} 
                />
              </div>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => handleSave('footer', footer)} 
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

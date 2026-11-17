import React, { useState } from 'react';
import { MessageSquarePlus, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api/axiosClient';

export default function FeedbackSubmit() {
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Using your app's configured Axios client so tokens and base URLs match automatically
      const response = await api.post('/feedback', {
        category,
        message,
        rating: Number(rating)
      });

      if (response.data.success || response.status === 201 || response.status === 200) {
        setSuccessMsg('Thank you! Your feedback has been successfully submitted and saved.');
        setMessage('');
        setRating(5);
        setCategory('General');
      } else {
        throw new Error(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred while submitting feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #142D4E 0%, #1E3A8A 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(20, 45, 78, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquarePlus size={26} color="#93C5FD" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Submit System Feedback
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: '4px 0 0 0' }}>
              Help us enhance NetTrack DFA network device management and telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form Card */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0'
        }}
      >
        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Category Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '0.9rem',
                  color: '#1E293B',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <option value="General">General Inquiry / Comment</option>
                <option value="Bug Report">Bug / Issue Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Network Performance">Network Performance / Telemetry</option>
              </select>
            </div>

            {/* Rating Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                System Satisfaction Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '0.9rem',
                  color: '#1E293B',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                <option value="3">⭐⭐⭐ (3 - Average)</option>
                <option value="2">⭐⭐ (2 - Poor)</option>
                <option value="1">⭐ (1 - Terrible)</option>
              </select>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              Detailed Message or Request
            </label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Describe your feedback, report a device access issue, or suggest a new network tool feature..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                fontSize: '0.9rem',
                color: '#1E293B',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '12px 24px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => !submitting && (e.currentTarget.style.background = '#2563EB')}
          >
            <Send size={18} />
            <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
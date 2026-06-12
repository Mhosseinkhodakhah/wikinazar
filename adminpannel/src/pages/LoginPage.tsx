import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: 300, height: 300,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
      }} />

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <form onSubmit={handleSubmit} style={{
          position: 'relative', zIndex: 1,
          background: '#1e293b', borderRadius: 16,
          padding: '2.5rem', width: '100%', maxWidth: 420,
          boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
          }}>
            <button type="button" onClick={toggleLang} style={{
              background: 'transparent', border: '1px solid #334155', borderRadius: 8,
              padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', color: '#64748b',
            }}>
              {lang === 'fa' ? 'English' : 'فارسی'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, letterSpacing: 2,
              marginBottom: 8, textTransform: 'uppercase',
            }}>
              WikiNazar
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              {t.app.login}
            </h1>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: 8,
              marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>
              {t.login.username}
            </label>
            <input
              type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required autoFocus dir="ltr"
              style={{
                width: '100%', padding: '0.7rem 0.85rem', borderRadius: 8,
                border: '1px solid #334155', background: '#0f172a', color: '#fff',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>
              {t.login.password}
            </label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required dir="ltr"
              style={{
                width: '100%', padding: '0.7rem 0.85rem', borderRadius: 8,
                border: '1px solid #334155', background: '#0f172a', color: '#fff',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
            />
          </div>

          <button
            type="submit" disabled={submitting}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 8,
              border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff', fontSize: '0.95rem', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1, transition: 'opacity 0.15s ease',
              boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
            }}
          >
            {submitting ? t.login.signingIn : t.login.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}

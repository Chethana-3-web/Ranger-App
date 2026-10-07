import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Login page — Admin Dashboard
 *
 * Credentials (hardcoded for SE3070 prototype):
 *   Email:    admin@example.com
 *   Password: Admin1!
 *
 * Sets localStorage key 'admin_auth' = 'true' on success.
 * PrivateRoute in App.jsx reads this to protect all dashboard routes.
 */
export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate brief async check
    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'Admin1!') {
        localStorage.setItem('admin_auth', 'true');
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use admin@example.com / Admin1!');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo — inline SVG, no external file needed */}
        <div style={styles.logoWrap}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#1B5E20" />
            {/* Shield shape */}
            <path d="M40 14 L58 22 L58 42 C58 54 40 66 40 66 C40 66 22 54 22 42 L22 22 Z"
                  fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
            {/* Elephant silhouette */}
            <ellipse cx="40" cy="43" rx="10" ry="8" fill="white" opacity="0.9" />
            <ellipse cx="32" cy="39" rx="5" ry="7" fill="white" opacity="0.9" />
            <rect x="32" y="48" width="3" height="7" rx="1.5" fill="white" opacity="0.9" />
            <rect x="37" y="49" width="3" height="7" rx="1.5" fill="white" opacity="0.9" />
            <rect x="42" y="49" width="3" height="7" rx="1.5" fill="white" opacity="0.9" />
            <rect x="47" y="48" width="3" height="7" rx="1.5" fill="white" opacity="0.9" />
            {/* Trunk */}
            <path d="M27 37 Q22 38 23 44" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
            {/* Eye */}
            <circle cx="30" cy="36" r="1.5" fill="#1B5E20" />
            {/* Tusk */}
            <path d="M27 40 Q24 42 25 45" stroke="#FFF9C4" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <h1 style={styles.title}>Smart Wildlife Conservation</h1>
        <p style={styles.subtitle}>Operations Dashboard — Admin Login</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.hint}>
          SE3070 · Sri Lanka Department of Wildlife Conservation
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    height: '100vh',
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #1B5E20 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    background: '#fff',
    padding: '40px 36px',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  logoWrap: {
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1B5E20',
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: '0.82rem',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    textAlign: 'left',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  errorBox: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  btn: {
    padding: '12px',
    background: '#1B5E20',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: 4,
    transition: 'background 0.15s',
  },
  hint: {
    marginTop: 24,
    fontSize: '0.72rem',
    color: '#9ca3af',
  },
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@example.com' && password === 'Admin1!') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1B5E20', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }} />
          <h1 style={{ margin: 0, fontSize: 24, color: '#333' }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: '#666', marginTop: 8 }}>Sign in to continue</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
              required 
            />
          </div>

          {error && <p style={{ color: '#d32f2f', margin: 0, fontSize: 14, textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit" 
            style={{ padding: 14, backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 16, marginTop: 8 }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

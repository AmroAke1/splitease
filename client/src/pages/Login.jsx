import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button onClick={() => navigate('/')} style={{ position: 'fixed', top: 16, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#757575', display: 'flex', alignItems: 'center', gap: 4 }}>
        🏠 Home
      </button>
      <div className="card auth-card">
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', width: '100%' }}>
          <div className="auth-logo">SplitEase</div>
        </button>
        <p className="auth-subtitle">Welcome back — sign in to continue</p>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-green btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
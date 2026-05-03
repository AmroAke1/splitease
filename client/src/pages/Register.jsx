import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', width: '100%' }}>
          <div className="auth-logo">SplitEase</div>
        </button>
        <p className="auth-subtitle">Create your account — it&apos;s free</p>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="form-control"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              autoFocus
            />
          </div>
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
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-green btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
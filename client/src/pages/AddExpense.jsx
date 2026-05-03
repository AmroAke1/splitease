import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', paid_by: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const { data } = await api.get(`/groups/${id}`);
        setMembers(data.members || []);
        setForm((f) => ({ ...f, paid_by: currentUser.id || '' }));
      } catch {
        setError('Failed to load group members.');
      }
    };
    fetchGroup();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/expenses', {
        group_id: id,
        description: form.description,
        amount: parseFloat(form.amount),
        paid_by: form.paid_by,
      });
      navigate(`/groups/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={() => navigate(`/groups/${id}`)}>← Back</button>
          <h1>Add Expense</h1>
        </div>
      </header>

      <main className="container">
        <div className="card form-card">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Dinner at Mario's"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="paid_by">Paid By</label>
              <select
                id="paid_by"
                name="paid_by"
                value={form.paid_by}
                onChange={handleChange}
                required
              >
                <option value="">Select who paid</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.id === currentUser.id ? ' (you)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Split Type</label>
              <select disabled>
                <option>Equal — split among all members</option>
              </select>
              <p className="field-hint">The amount is divided equally among all group members.</p>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/groups/${id}`)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
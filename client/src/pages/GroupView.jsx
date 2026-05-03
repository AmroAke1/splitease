import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const getInitials = (name) =>
  (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const fmt = (n) => `$${Math.abs(parseFloat(n)).toFixed(2)}`;

function computeNetPositions(expenses, members, splitMethod) {
  const net = {};
  members.forEach((m) => { net[m.name] = 0; });

  expenses.forEach((exp) => {
    const payer = localStorage.getItem(`expense_paid_${exp.id}`) || exp.paid_by_name || '';
    const amount = parseFloat(exp.amount);

    members.forEach((m, i) => {
      const share = splitMethod === 'percentage'
        ? amount * ((m.percentage || 0) / 100)
        : amount / members.length;

      if (m.name === payer) {
        net[m.name] = (net[m.name] || 0) + (amount - share);
      } else {
        net[m.name] = (net[m.name] || 0) - share;
      }
    });
  });

  return net;
}

function AddExpenseModal({ groupId, members, onClose, onAdded }) {
  const [form, setForm] = useState({ description: '', amount: '', paid_by: members[0]?.name || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/expenses', {
        group_id: groupId,
        description: form.description,
        amount: parseFloat(form.amount),
      });
      localStorage.setItem(`expense_paid_${data.id}`, form.paid_by);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2>Add Expense</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Expense Name</label>
            <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Hotel, Groceries, Uber" required autoFocus />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input className="form-control" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
          </div>
          <div className="form-group">
            <label>Paid By</label>
            <select className="form-control" value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} required>
              {members.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-green btn-full" disabled={loading}>
              {loading ? 'Adding…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const meta = JSON.parse(localStorage.getItem(`group_meta_${id}`) || '{}');
  const members = meta.members || [];
  const splitMethod = meta.splitMethod || 'equal';

  const fetchData = useCallback(async () => {
    try {
      const [gRes, eRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/${id}`),
      ]);
      setGroup(gRes.data);
      setExpenses(eRes.data);
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const netPositions = members.length > 0 ? computeNetPositions(expenses, members, splitMethod) : {};

  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}>Loading…</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Back</button>
          <button className="navbar-logo" style={{ fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }} onClick={() => navigate('/dashboard')}>SplitEase</button>
          {meta.type && <span className="badge">{meta.type}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>🏠 Home</button>
          <button className="btn btn-green btn-sm" onClick={() => setShowExpenseModal(true)}>
            + Add Expense
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px' }}>
        {/* Total expenses circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2E7D32, #43A047)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(46,125,50,0.35)',
            marginBottom: 10,
          }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              ${total.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Total Expenses
            </span>
          </div>
        </div>

        {/* Members */}
        {members.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Members
            </h3>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {members.map((m) => (
                <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div className="avatar">{getInitials(m.name)}</div>
                  <span style={{ fontSize: '0.8rem', color: '#424242', fontWeight: 500 }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Who Pays What */}
        {members.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Who Pays What
            </h3>
            {expenses.length === 0 ? (
              <p style={{ color: '#9E9E9E', fontSize: '0.875rem' }}>Add expenses to see the breakdown.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {members.map((m) => {
                    const val = netPositions[m.name] ?? 0;
                    const isOwed = val > 0.005;
                    const owes = val < -0.005;
                    return (
                      <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #EEEEEE' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{getInitials(m.name)}</div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</span>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isOwed ? '#2E7D32' : owes ? '#c62828' : '#9E9E9E' }}>
                          {isOwed ? `+ ${fmt(val)}` : owes ? `− ${fmt(val)}` : '$0.00'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9E9E9E', marginTop: 10 }}>
                  Based on {splitMethod === 'equal' ? 'equal split' : 'percentage split'}
                </p>
              </>
            )}
          </div>
        )}

        {/* Expenses list */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E7D32' }}>Expenses</h2>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state" style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0E0E0' }}>
            <span className="empty-icon">🧾</span>
            <h3>No expenses yet</h3>
            <p>Hit &quot;Add Expense&quot; to log the first one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map((exp) => {
              const paidByName = localStorage.getItem(`expense_paid_${exp.id}`) || exp.paid_by_name;
              return (
                <div key={exp.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{exp.description}</p>
                    <p style={{ fontSize: '0.8rem', color: '#9E9E9E', marginTop: 2 }}>
                      Paid by {paidByName} · {new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#C9A84C' }}>
                    ${parseFloat(exp.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* View balances */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <button className="btn btn-gold btn-lg" onClick={() => navigate(`/groups/${id}/balances`)}>
            View Balances →
          </button>
        </div>
      </main>

      {showExpenseModal && (
        <AddExpenseModal
          groupId={id}
          members={members.length > 0 ? members : [{ name: JSON.parse(localStorage.getItem('user') || '{}').name || 'You' }]}
          onClose={() => setShowExpenseModal(false)}
          onAdded={fetchData}
        />
      )}
    </div>
  );
}
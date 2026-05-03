import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const getInitials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);

function CreateGroupModal({ onClose, onCreated }) {
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('');
  const [numMembers, setNumMembers] = useState(2);
  const [memberNames, setMemberNames] = useState(['', '']);
  const [splitMethod, setSplitMethod] = useState('equal');
  const [percentages, setPercentages] = useState([50, 50]);
  const [pctError, setPctError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNumMembersChange = (val) => {
    const n = Math.max(2, Math.min(20, parseInt(val) || 2));
    setNumMembers(n);
    setMemberNames((prev) => {
      const arr = [...prev];
      while (arr.length < n) arr.push('');
      return arr.slice(0, n);
    });
    setPercentages((prev) => {
      const arr = [...prev];
      while (arr.length < n) arr.push(0);
      const sliced = arr.slice(0, n);
      const even = Math.floor(100 / n);
      const rem = 100 - even * n;
      return sliced.map((_, i) => (i === 0 ? even + rem : even));
    });
  };

  const handleMemberName = (i, val) => {
    setMemberNames((prev) => { const a = [...prev]; a[i] = val; return a; });
  };

  const handlePct = (i, val) => {
    setPctError('');
    setPercentages((prev) => { const a = [...prev]; a[i] = val; return a; });
  };

  const pctTotal = percentages.slice(0, numMembers).reduce((s, v) => s + Number(v || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (splitMethod === 'percentage') {
      if (Math.abs(pctTotal - 100) > 0.01) {
        setPctError(`Percentages must add up to 100% — currently ${pctTotal.toFixed(1)}%`);
        return;
      }
    }
    setLoading(true);
    try {
      const { data } = await api.post('/groups', { name: groupName });
      const members = memberNames.slice(0, numMembers).map((name, i) => ({
        name: name || `Member ${i + 1}`,
        percentage: splitMethod === 'percentage' ? Number(percentages[i] || 0) : parseFloat((100 / numMembers).toFixed(4)),
      }));
      localStorage.setItem(`group_meta_${data.id}`, JSON.stringify({
        type: groupType,
        splitMethod,
        members,
      }));
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Create a New Group</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Group Name</label>
            <input className="form-control" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Italy Trip 2025" required />
          </div>

          <div className="form-group">
            <label>Group Type</label>
            <input className="form-control" value={groupType} onChange={(e) => setGroupType(e.target.value)} placeholder="e.g. Road Trip, Monthly Rent, Dinner, Vacation" />
          </div>

          <div className="form-group">
            <label>Number of Members</label>
            <input className="form-control" type="number" min="2" max="20" value={numMembers} onChange={(e) => handleNumMembersChange(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Split Method</label>
            <div className="radio-group">
              {['equal', 'percentage'].map((m) => (
                <label key={m} className={`radio-option ${splitMethod === m ? 'active' : ''}`}>
                  <input type="radio" value={m} checked={splitMethod === m} onChange={() => { setSplitMethod(m); setPctError(''); }} />
                  {m === 'equal' ? 'Split Equally' : 'By Percentage'}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'block' }}>
              Member Names
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: numMembers }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2E7D32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <input
                    className="form-control"
                    value={memberNames[i] || ''}
                    onChange={(e) => handleMemberName(i, e.target.value)}
                    placeholder={`Member ${i + 1} name`}
                    style={{ flex: 1 }}
                  />
                  {splitMethod === 'percentage' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={percentages[i] ?? 0}
                        onChange={(e) => handlePct(i, e.target.value)}
                        style={{ width: 72 }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#757575' }}>%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {splitMethod === 'percentage' && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#757575' }}>Total: {pctTotal.toFixed(1)}%</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: Math.abs(pctTotal - 100) < 0.01 ? '#2E7D32' : '#c62828' }}>
                  {Math.abs(pctTotal - 100) < 0.01 ? '✓ Looks good' : `${(100 - pctTotal).toFixed(1)}% remaining`}
                </span>
              </div>
            )}
            {pctError && <div className="error-msg" style={{ marginTop: 8 }}>{pctError}</div>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-green btn-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [groups, setGroups] = useState([]);
  const [groupTotals, setGroupTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
      // fetch totals in parallel
      const totals = {};
      await Promise.all(data.map(async (g) => {
        try {
          const res = await api.get(`/expenses/${g.id}`);
          totals[g.id] = res.data.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        } catch {
          totals[g.id] = 0;
        }
      }));
      setGroupTotals(totals);
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Navbar */}
      <nav className="navbar">
        <button className="navbar-logo" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }} onClick={() => navigate('/dashboard')}>SplitEase</button>
        <div className="navbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>🏠 Home</button>
          <span className="navbar-user">👋 {user.name}</span>
          <button className="btn btn-green btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32', letterSpacing: '-0.5px' }}>
              Welcome back, {user.name?.split(' ')[0]}!
            </h1>
            <p style={{ color: '#757575', fontSize: '0.9rem', marginTop: 4 }}>
              Here are all your groups.
            </p>
          </div>
          <button className="btn btn-green" onClick={() => setShowModal(true)} style={{ flexShrink: 0 }}>
            + Create a Group
          </button>
        </div>

        {/* Groups grid */}
        {loading ? (
          <div className="loading">Loading your groups…</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏝️</span>
            <h3>No groups yet — create your first one!</h3>
            <p>Track expenses with friends, family, or roommates.</p>
            <button className="btn btn-green" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>
              + Create a Group
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {groups.map((g) => {
              const meta = JSON.parse(localStorage.getItem(`group_meta_${g.id}`) || '{}');
              const total = groupTotals[g.id] ?? 0;
              const memberCount = meta.members?.length ?? 1;
              return (
                <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A', flex: 1, marginRight: 8 }}>{g.name}</h3>
                    {meta.type && <span className="badge">{meta.type}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Members</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2E7D32' }}>{memberCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Spent</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#C9A84C' }}>${total.toFixed(2)}</div>
                    </div>
                  </div>
                  <button className="btn btn-gold btn-full btn-sm" style={{ marginTop: 'auto' }} onClick={() => navigate(`/groups/${g.id}`)}>
                    Open Group →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Decorative green line */}
      <div style={{ height: 6, background: 'linear-gradient(90deg, #1B5E20, #2E7D32, #43A047, #C9A84C, #43A047, #2E7D32, #1B5E20)', marginTop: 'auto' }} />

      {showModal && <CreateGroupModal onClose={() => setShowModal(false)} onCreated={fetchGroups} />}
    </div>
  );
}

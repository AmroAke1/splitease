import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const fmt = (n) => `$${Math.abs(parseFloat(n)).toFixed(2)}`;
const getInitials = (name) =>
  (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);

function computeDebts(netPositions) {
  const creditors = Object.entries(netPositions)
    .filter(([, v]) => v > 0.005)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(netPositions)
    .filter(([, v]) => v < -0.005)
    .map(([name, amount]) => ({ name, amount: Math.abs(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const debts = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].amount, debtors[j].amount);
    if (amount > 0.005) {
      debts.push({ from: debtors[j].name, to: creditors[i].name, amount: Math.round(amount * 100) / 100 });
    }
    creditors[i].amount -= amount;
    debtors[j].amount -= amount;
    if (creditors[i].amount < 0.005) i++;
    if (debtors[j].amount < 0.005) j++;
  }
  return debts;
}

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

export default function BalanceSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [settled, setSettled] = useState(() => {
    return JSON.parse(localStorage.getItem(`settled_${id}`) || '[]');
  });

  const meta = JSON.parse(localStorage.getItem(`group_meta_${id}`) || '{}');
  const members = meta.members || [];
  const splitMethod = meta.splitMethod || 'equal';

  const fetchData = useCallback(async () => {
    try {
      const [gRes, eRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/${id}`),
      ]);
      setGroupName(gRes.data.name);
      setExpenses(eRes.data);
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const netPositions = members.length > 0 ? computeNetPositions(expenses, members, splitMethod) : {};
  const allDebts = members.length > 0 ? computeDebts(netPositions) : [];
  const activeDebts = allDebts.filter(d => !settled.includes(`${d.from}→${d.to}`));

  const handleSettle = (debt) => {
    navigate(`/groups/${id}/settle`, { state: { debt, groupName } });
  };

  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}>Loading…</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/groups/${id}`)}>← Back</button>
          <button className="navbar-logo" style={{ fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }} onClick={() => navigate('/dashboard')}>SplitEase</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {groupName && <span style={{ fontSize: '0.875rem', color: '#757575' }}>{groupName}</span>}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>🏠 Home</button>
        </div>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px' }}>
        {/* Net positions */}
        {members.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#2E7D32', marginBottom: 16 }}>Net Positions</h2>
            {Object.keys(netPositions).length === 0 ? (
              <p style={{ color: '#9E9E9E', fontSize: '0.875rem' }}>No expenses yet.</p>
            ) : (
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
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isOwed ? '#2E7D32' : owes ? '#c62828' : '#9E9E9E' }}>
                          {isOwed ? `+ ${fmt(val)}` : owes ? `− ${fmt(val)}` : '$0.00'}
                        </span>
                        <p style={{ fontSize: '0.72rem', color: '#BDBDBD', marginTop: 2 }}>
                          {isOwed ? 'is owed' : owes ? 'owes' : 'settled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Specific debts */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#2E7D32', marginBottom: 16 }}>
            Who Owes Who
          </h2>

          {activeDebts.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <span className="empty-icon" style={{ fontSize: '2.5rem' }}>🎉</span>
              <h3>All settled up!</h3>
              <p>No outstanding debts in this group.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeDebts.map((debt) => (
                <div key={`${debt.from}→${debt.to}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #EEEEEE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar avatar-sm" style={{ background: '#c62828' }}>{getInitials(debt.from)}</div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        <span style={{ color: '#c62828' }}>{debt.from}</span>
                        <span style={{ color: '#9E9E9E', margin: '0 6px' }}>owes</span>
                        <span style={{ color: '#2E7D32' }}>{debt.to}</span>
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#C9A84C', marginTop: 2 }}>
                        {fmt(debt.amount)}
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-gold btn-sm" onClick={() => handleSettle(debt)}>
                    Settle Up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
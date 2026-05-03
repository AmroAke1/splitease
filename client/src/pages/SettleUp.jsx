import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function SettleUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const balance = location.state?.balance;
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState('');

  if (!balance) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-message">No balance data provided.</div>
          <button className="btn btn-secondary" onClick={() => navigate(`/groups/${id}/balances`)}>
            Back to Balances
          </button>
        </div>
      </div>
    );
  }

  const handleSettle = async () => {
    setError('');
    setSettling(true);
    try {
      await api.post('/settlements', {
        group_id: id,
        paid_to: balance.owed_user_id,
        amount: parseFloat(balance.amount),
      });
      navigate(`/groups/${id}/balances`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record settlement.');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={() => navigate(`/groups/${id}/balances`)}>← Back</button>
          <h1>Settle Up</h1>
        </div>
      </header>

      <main className="container">
        <div className="card settle-card">
          <div className="settle-details">
            <p className="settle-label">Payment to Confirm</p>
            <div className="settle-amount-display">
              <span className="settle-from">{balance.owes_name}</span>
              <span className="settle-arrow">→</span>
              <span className="settle-to">{balance.owed_name}</span>
            </div>
            <p className="settle-amount">${parseFloat(balance.amount).toFixed(2)}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/groups/${id}/balances`)}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleSettle}
              disabled={settling}
            >
              {settling ? 'Recording...' : 'Confirm Settlement'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
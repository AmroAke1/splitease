import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BalanceSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [balances, setBalances] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, balancesRes] = await Promise.all([
          api.get(`/groups/${id}`),
          api.get(`/balances/${id}`),
        ]);
        setGroupName(groupRes.data.name);
        setBalances(balancesRes.data);
      } catch {
        setError('Failed to load balances.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSettleUp = (balance) => {
    navigate(`/groups/${id}/settle`, { state: { balance } });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container loading">Loading balances...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={() => navigate(`/groups/${id}`)}>← Back</button>
          <h1>Balance Summary</h1>
        </div>
      </header>

      <main className="container">
        {groupName && <p className="subtitle">{groupName}</p>}

        {error && <div className="error-message">{error}</div>}

        {!error && balances.length === 0 ? (
          <div className="empty-state">
            <p>All settled up! No outstanding balances.</p>
          </div>
        ) : (
          <div className="balance-list">
            {balances.map((balance) => (
              <div key={balance.id} className="card balance-card">
                <div className="balance-info">
                  <p className="balance-text">
                    <strong>{balance.owes_name}</strong> owes <strong>{balance.owed_name}</strong>
                  </p>
                  <p className="balance-amount">${parseFloat(balance.amount).toFixed(2)}</p>
                </div>
                <button
                  className="btn btn-success"
                  onClick={() => handleSettleUp(balance)}
                >
                  Settle Up
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function GroupView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, expensesRes] = await Promise.all([
          api.get(`/groups/${id}`),
          api.get(`/expenses/${id}`),
        ]);
        setGroup(groupRes.data);
        setExpenses(expensesRes.data);
      } catch {
        setError('Failed to load group details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="container loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-message">{error}</div>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
          <h1>{group?.name}</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/groups/${id}/balances`)}
          >
            Balances
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/groups/${id}/add-expense`)}
          >
            + Add Expense
          </button>
        </div>
      </header>

      <main className="container">
        {group?.members && group.members.length > 0 && (
          <div className="members-bar">
            <span className="label">Members:</span>
            {group.members.map((m) => (
              <span key={m.id} className="member-chip">{m.name}</span>
            ))}
          </div>
        )}

        <div className="section-header">
          <h2>Expenses</h2>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet. Add the first one!</p>
          </div>
        ) : (
          <div className="expense-list">
            {expenses.map((exp) => (
              <div key={exp.id} className="card expense-card">
                <div className="expense-info">
                  <p className="expense-description">{exp.description}</p>
                  <p className="expense-meta">Paid by {exp.paid_by_name}</p>
                  <p className="expense-date">{new Date(exp.created_at).toLocaleDateString()}</p>
                </div>
                <div className="expense-amount">${parseFloat(exp.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
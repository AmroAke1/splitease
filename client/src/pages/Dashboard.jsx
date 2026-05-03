import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch {
      setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      await api.post('/groups', { name: newGroupName.trim() });
      setNewGroupName('');
      setShowCreateForm(false);
      fetchGroups();
    } catch {
      setError('Failed to create group.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="app-name">SplitEase</h1>
        <div className="header-actions">
          <span className="user-greeting">Hi, {user.name || 'there'}!</span>
          <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
        </div>
      </header>

      <main className="container">
        <div className="section-header">
          <h2>Your Groups</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ New Group'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card create-form">
            <form onSubmit={handleCreateGroup} className="inline-form">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. Weekend Trip)"
                className="form-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <p>No groups yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="card-grid">
            {groups.map((group) => (
              <div key={group.id} className="card group-card">
                <div className="group-card-content">
                  <p className="group-name">{group.name}</p>
                  <p className="group-meta">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
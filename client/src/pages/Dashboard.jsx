import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your groups and recent activity will appear here.</p>
      <Link to="/groups/new">Create Group</Link>
    </div>
  );
}
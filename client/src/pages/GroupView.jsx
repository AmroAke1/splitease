import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function GroupView() {
  const { id } = useParams();

  return (
    <div>
      <h1>Group #{id}</h1>
      <p>Group expenses and members will appear here.</p>
      <Link to={`/groups/${id}/add-expense`}>Add Expense</Link>
      <br />
      <Link to={`/groups/${id}/balances`}>View Balances</Link>
    </div>
  );
}
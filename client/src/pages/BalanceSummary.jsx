import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BalanceSummary() {
  const { id: groupId } = useParams();

  return (
    <div>
      <h1>Balance Summary</h1>
      <p>Who owes what in group #{groupId} will appear here.</p>
      <Link to={`/groups/${groupId}/settle`}>Settle Up</Link>
    </div>
  );
}
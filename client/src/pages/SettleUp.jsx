import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SettleUp() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: '', to: '', amount: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: POST /api/settlements
    navigate(`/groups/${groupId}/balances`);
  }

  return (
    <div>
      <h1>Settle Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>From</label>
          <input name="from" value={form.from} onChange={handleChange} required />
        </div>
        <div>
          <label>To</label>
          <input name="to" value={form.to} onChange={handleChange} required />
        </div>
        <div>
          <label>Amount</label>
          <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} required />
        </div>
        <button type="submit">Confirm Settlement</button>
      </form>
    </div>
  );
}
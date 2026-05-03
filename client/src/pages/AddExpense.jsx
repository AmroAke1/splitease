import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function AddExpense() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ description: '', amount: '', paidBy: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: POST /api/expenses
    navigate(`/groups/${groupId}`);
  }

  return (
    <div>
      <h1>Add Expense</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Amount</label>
          <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} required />
        </div>
        <div>
          <label>Paid by</label>
          <input name="paidBy" value={form.paidBy} onChange={handleChange} required />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GroupView from './pages/GroupView';
import AddExpense from './pages/AddExpense';
import BalanceSummary from './pages/BalanceSummary';
import SettleUp from './pages/SettleUp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/groups/:id" element={<GroupView />} />
        <Route path="/groups/:id/add-expense" element={<AddExpense />} />
        <Route path="/groups/:id/balances" element={<BalanceSummary />} />
        <Route path="/groups/:id/settle" element={<SettleUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
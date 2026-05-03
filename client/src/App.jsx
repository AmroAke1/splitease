import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GroupView from './pages/GroupView';
import AddExpense from './pages/AddExpense';
import BalanceSummary from './pages/BalanceSummary';
import SettleUp from './pages/SettleUp';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupView /></PrivateRoute>} />
        <Route path="/groups/:id/add-expense" element={<PrivateRoute><AddExpense /></PrivateRoute>} />
        <Route path="/groups/:id/balances" element={<PrivateRoute><BalanceSummary /></PrivateRoute>} />
        <Route path="/groups/:id/settle" element={<PrivateRoute><SettleUp /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupView from './pages/GroupView';
import BalanceSummary from './pages/BalanceSummary';
import SettleUp from './pages/SettleUp';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupView /></PrivateRoute>} />
        <Route path="/groups/:id/balances" element={<PrivateRoute><BalanceSummary /></PrivateRoute>} />
        <Route path="/groups/:id/settle" element={<PrivateRoute><SettleUp /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
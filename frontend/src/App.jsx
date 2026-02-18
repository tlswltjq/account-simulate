import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AccountDetail from './pages/AccountDetail';
import { useAuth } from './context/AuthContext';

function App() {
  const { username } = useAuth();

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children }) => {
    if (!username) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // 공개 라우트 컴포넌트 (로그인 상태에서 접근 시 대시보드로 리다이렉트)
  const PublicRoute = ({ children }) => {
    if (username) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/account/:accountAddress" element={
        <ProtectedRoute>
          <AccountDetail />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;

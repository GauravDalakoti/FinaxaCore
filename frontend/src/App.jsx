import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoadingScreen from './components/layout/LoadingScreen.jsx';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="records" element={<RecordsPage />} />
      <Route path="users" element={<PrivateRoute allowedRoles={['admin']}><UsersPage /></PrivateRoute>} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
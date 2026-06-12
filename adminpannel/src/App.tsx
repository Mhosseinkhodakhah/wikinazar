import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider } from './i18n';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminsPage from './pages/AdminsPage';
import UsersPage from './pages/UsersPage';
import SubjectsPage from './pages/SubjectsPage';
import ExperiencesPage from './pages/ExperiencesPage';
import RequestsPage from './pages/RequestsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>Loading...</div>;
  if (!admin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PermissionRoute({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/login" replace />;
  const hasAccess = admin.isSuperAdmin || admin.permissions.includes(permission);
  if (!hasAccess) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="admins" element={<PermissionRoute permission="admins"><AdminsPage /></PermissionRoute>} />
        <Route path="users" element={<PermissionRoute permission="users"><UsersPage /></PermissionRoute>} />
        <Route path="subjects" element={<PermissionRoute permission="subjects"><SubjectsPage /></PermissionRoute>} />
        <Route path="experiences" element={<PermissionRoute permission="experiences"><ExperiencesPage /></PermissionRoute>} />
        <Route path="requests" element={<PermissionRoute permission="requests"><RequestsPage /></PermissionRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </I18nProvider>
  );
}

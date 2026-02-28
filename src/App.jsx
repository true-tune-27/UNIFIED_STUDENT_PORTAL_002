import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import FacultyDashboard from './FacultyDashboard';
import TeachingDashboard from './TeachingDashboard';
import ResearchDashboard from './ResearchDashboard';
import ExpertiseDashboard from './ExpertiseDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import HODDashboard from './HODDashboard';
import DeanDashboard from './DeanDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

/* ── Protected route: redirects to login if not authenticated ── */
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/faculty-dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Faculty routes */}
      <Route path="/faculty-dashboard" element={
        <ProtectedRoute><FacultyDashboard /></ProtectedRoute>
      } />
      <Route path="/teaching-dashboard" element={
        <ProtectedRoute><TeachingDashboard /></ProtectedRoute>
      } />
      <Route path="/research-dashboard" element={
        <ProtectedRoute><ResearchDashboard /></ProtectedRoute>
      } />
      <Route path="/expertise-dashboard" element={
        <ProtectedRoute><ExpertiseDashboard /></ProtectedRoute>
      } />

      {/* Admin role routes */}
      <Route path="/coordinator-dashboard" element={
        <ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>
      } />
      <Route path="/hod-dashboard" element={
        <ProtectedRoute><HODDashboard /></ProtectedRoute>
      } />
      <Route path="/dean-dashboard" element={
        <ProtectedRoute><DeanDashboard /></ProtectedRoute>
      } />

      {/* Super Admin */}
      <Route path="/super-admin" element={
        <ProtectedRoute allowedRoles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

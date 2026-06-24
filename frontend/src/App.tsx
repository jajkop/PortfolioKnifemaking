import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import KnifeDetailPage from './pages/KnifeDetailPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminKnifeFormPage from './pages/admin/AdminKnifeFormPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="kontakt" element={<ContactPage />} />
        <Route path="noze/:id" element={<KnifeDetailPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/noze/nowy"
          element={
            <ProtectedRoute>
              <AdminKnifeFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/noze/:id"
          element={
            <ProtectedRoute>
              <AdminKnifeFormPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

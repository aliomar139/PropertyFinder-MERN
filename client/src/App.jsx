import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Welcome from './pages/Welcome.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Home from './pages/Home.jsx';
import ListPage from './pages/ListPage.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import EditProperty from './pages/EditProperty.jsx';
import MyProperties from './pages/MyProperties.jsx';
import Favorites from './pages/Favorites.jsx';
import Profile from './pages/Profile.jsx';
import UserChangePass from './pages/UserChangePass.jsx';
import UserDetails from './pages/UserDetails.jsx';
import VerifyRequest from './pages/VerifyRequest.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import PropertyManagement from './pages/admin/PropertyManagement.jsx';
import Reports from './pages/admin/Reports.jsx';
import BannedOwners from './pages/admin/BannedOwners.jsx';
import VerifyRequests from './pages/admin/VerifyRequests.jsx';

// Route guards — replace the PHP `if (!isset($_SESSION['userId'])) redirect` pattern
function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 1 ? children : <Navigate to="/home" replace />;
}

// PHP did a full page load on every navigation, so each page started at the
// top. SPA routing keeps the old scroll position — reset it on route change.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/change-pass" element={<ChangePassword />} />

      <Route path="/home" element={<Private><Home /></Private>} />
      <Route path="/list" element={<Private><ListPage /></Private>} />
      <Route path="/property/:id" element={<Private><PropertyDetails /></Private>} />
      <Route path="/property/:id/edit" element={<Private><EditProperty /></Private>} />
      <Route path="/my-properties" element={<Private><MyProperties /></Private>} />
      <Route path="/favorites" element={<Private><Favorites /></Private>} />
      <Route path="/user" element={<Private><Profile /></Private>} />
      <Route path="/user/change-pass" element={<Private><UserChangePass /></Private>} />
      <Route path="/users/:id" element={<Private><UserDetails /></Private>} />
      <Route path="/verify" element={<Private><VerifyRequest /></Private>} />

      <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
      <Route path="/admin/users" element={<AdminOnly><UserManagement /></AdminOnly>} />
      <Route path="/admin/properties" element={<AdminOnly><PropertyManagement /></AdminOnly>} />
      <Route path="/admin/reports" element={<AdminOnly><Reports /></AdminOnly>} />
      <Route path="/admin/banned" element={<AdminOnly><BannedOwners /></AdminOnly>} />
      <Route path="/admin/verify-requests" element={<AdminOnly><VerifyRequests /></AdminOnly>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

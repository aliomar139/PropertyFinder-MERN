import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar.jsx';
import '../../styles/admin.css';

// admin.php
export default function AdminDashboard() {
  return (
    <div className="page-admin">
      <AdminNavbar />
      <div className="content">
        <h2>Admin Dashboard</h2>
        <div className="admin-options">
          <Link to="/admin/users" className="admin-button">User Management</Link>
          <Link to="/admin/properties" className="admin-button">Property Management</Link>
          <Link to="/admin/verify-requests" className="admin-button">Verify Requests</Link>
          <Link to="/admin/reports" className="admin-button">Check Reports</Link>
          <Link to="/admin/banned" className="admin-button">Check Banned Owners</Link>
        </div>
      </div>
    </div>
  );
}

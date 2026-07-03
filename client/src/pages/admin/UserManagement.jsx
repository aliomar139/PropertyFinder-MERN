import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import AdminNavbar from './AdminNavbar.jsx';
import '../../styles/user_management.css';

// user_management.php — all users + property counts + Ban action
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const load = () => api.get('/admin/users').then(({ data }) => setUsers(data.users)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function ban(userId) {
    if (!window.confirm('Are you sure you want to ban this user? This will also delete all their properties!')) return;
    try {
      const { data } = await api.post(`/admin/users/${userId}/ban`);
      setMessage(data.message);
      load();
    } catch (err) {
      setMessage(errMsg(err));
    }
  }

  return (
    <div className="page-user-mgmt">
      {message && <div className="message">{message}</div>}
      <AdminNavbar />
      <div className="content">
        <table className="property-table">
          <thead>
            <tr>
              <th>User ID</th><th>Full Name</th><th>Email</th><th>Property Count</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? users.map((u) => (
              <tr key={u.id}>
                <td>{u.id.slice(-6)}</td>
                <td>
                  <Link to={`/users/${u.id}`} className="view-details-link">
                    {u.firstname} {u.lastname}
                  </Link>
                </td>
                <td>{u.email}</td>
                <td>{u.propertyCount}</td>
                <td>
                  {u.status !== 0 ? (
                    <span className="admin-label">Banned</span>
                  ) : u.role !== 1 ? (
                    <button className="ban-btn" onClick={() => ban(u.id)}>Ban</button>
                  ) : (
                    <span className="admin-label">Admin</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

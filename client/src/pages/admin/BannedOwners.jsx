import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import AdminNavbar from './AdminNavbar.jsx';
import '../../styles/banned_owners.css';

// banned_owners.php — banned users + Unban action
export default function BannedOwners() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const load = () => api.get('/admin/users/banned').then(({ data }) => setUsers(data.users)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function unban(userId) {
    try {
      const { data } = await api.post(`/admin/users/${userId}/unban`);
      setMessage(data.message);
      load();
    } catch (err) {
      setMessage(errMsg(err));
    }
  }

  return (
    <div className="page-banned">
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
                  <div className="title">
                    <Link to={`/users/${u.id}`} className="view-details-link">
                      {u.firstname} {u.lastname}
                    </Link>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.propertyCount}</td>
                <td><button className="unban-btn" onClick={() => unban(u.id)}>Unban</button></td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No banned users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import AdminNavbar from './AdminNavbar.jsx';
import '../../styles/reports.css';

// reports.php — all reports with Ignore (delete) action
export default function Reports() {
  const [reports, setReports] = useState([]);

  const load = () => api.get('/reports').then(({ data }) => setReports(data.reports)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function ignore(id) {
    if (!window.confirm('Are you sure you want to ignore this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      load();
    } catch { /* noop */ }
  }

  return (
    <div className="page-reports">
      <AdminNavbar />
      <div className="content">
        <table className="property-table">
          <thead>
            <tr>
              <th>Report Id</th><th>Reporting User</th><th>Reported User</th>
              <th>Reported Property</th><th>Reason Message</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.length ? reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id.slice(-6)}</td>
                <td>
                  {r.reportingUser ? (
                    <Link to={`/users/${r.reportingUser.id}`} className="view-details-link">
                      {r.reportingUser.firstname} {r.reportingUser.lastname}
                    </Link>
                  ) : '—'}
                </td>
                <td>
                  {r.reportedUser ? (
                    <Link to={`/users/${r.reportedUser.id}`} className="view-details-link">
                      {r.reportedUser.firstname} {r.reportedUser.lastname}
                    </Link>
                  ) : '—'}
                </td>
                <td><Link to={`/property/${r.property.id}`} className="view-details-link">View Details</Link></td>
                <td>{r.reason}</td>
                <td><button className="ban-btn" onClick={() => ignore(r.id)}>Ignore</button></td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No reports found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

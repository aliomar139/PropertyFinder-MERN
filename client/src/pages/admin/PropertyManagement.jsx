import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import AdminNavbar from './AdminNavbar.jsx';
import '../../styles/property_management.css';

// property_management.php — all properties with submitter links
export default function PropertyManagement() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    api.get('/admin/properties').then(({ data }) => setProperties(data.properties)).catch(() => {});
  }, []);

  return (
    <div className="page-prop-mgmt">
      <AdminNavbar />
      <div className="content">
        <table className="property-table">
          <thead>
            <tr>
              <th>Property ID</th><th>Title</th><th>Submitted By</th><th>Submitter ID</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.length ? properties.map((p) => (
              <tr key={p.id}>
                <td>{p.id.slice(-6)}</td>
                <td><div className="title">{p.title}</div></td>
                <td>
                  {p.owner ? (
                    <Link to={`/users/${p.owner.id}`} className="view-details-link">
                      {p.owner.firstname} {p.owner.lastname}
                    </Link>
                  ) : '—'}
                </td>
                <td>{p.owner ? p.owner.id.slice(-6) : '—'}</td>
                <td><Link to={`/property/${p.id}`} className="view-details-link">View Details</Link></td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No properties found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import AdminPage from './AdminPage.jsx';
import '../../styles/property_management.css';

const COLUMNS = ['ID', 'Title', 'Submitted by', 'Owner ID', 'Action'];

export default function PropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/properties')
      .then(({ data }) => setProperties(data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage
      title="Listings"
      description="Every property published on PropertyFinder."
      columns={COLUMNS}
      rows={properties}
      loading={loading}
      emptyText="No listings have been published yet."
      renderRow={(p) => (
        <tr key={p.id}>
          <td className="pf-table__id">{p.id.slice(-6)}</td>
          <td className="pf-table__primary">{p.title}</td>
          <td>
            {p.owner ? (
              <Link to={`/users/${p.owner.id}`}>
                {p.owner.firstname} {p.owner.lastname}
              </Link>
            ) : (
              <span className="pf-muted">Deleted account</span>
            )}
          </td>
          <td className="pf-table__id">{p.owner ? p.owner.id.slice(-6) : '—'}</td>
          <td>
            <Link to={`/property/${p.id}`}>Open listing</Link>
          </td>
        </tr>
      )}
    />
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import AdminPage from './AdminPage.jsx';
import Button from '../../components/ui/Button.jsx';
import '../../styles/banned_owners.css';

const COLUMNS = ['ID', 'Name', 'Email', 'Listings', 'Action'];

export default function BannedOwners() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [tone, setTone] = useState('success');
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    api
      .get('/admin/users/banned')
      .then(({ data }) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function unban(userId) {
    setBusyId(userId);
    try {
      const { data } = await api.post(`/admin/users/${userId}/unban`);
      setTone('success');
      setToast(data.message);
      load();
    } catch (err) {
      setTone('error');
      setToast(errMsg(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPage
      title="Banned owners"
      description="Suspended accounts. Lifting a ban restores access but does not restore deleted listings."
      columns={COLUMNS}
      rows={users}
      loading={loading}
      emptyText="Nobody is currently banned."
      toast={toast}
      toastTone={tone}
      onToastDismiss={() => setToast('')}
      renderRow={(u) => (
        <tr key={u.id}>
          <td className="pf-table__id">{u.id.slice(-6)}</td>
          <td>
            <Link to={`/users/${u.id}`} className="pf-table__primary">
              {u.firstname} {u.lastname}
            </Link>
          </td>
          <td>{u.email}</td>
          <td className="pf-num">{u.propertyCount}</td>
          <td>
            {/* Unbanning is constructive and reversible, so it commits directly
                rather than behind a confirmation nobody would read. */}
            <Button
              variant="secondary"
              size="sm"
              icon="check"
              loading={busyId === u.id}
              loadingLabel="Working…"
              onClick={() => unban(u.id)}
            >
              Lift ban
            </Button>
          </td>
        </tr>
      )}
    />
  );
}

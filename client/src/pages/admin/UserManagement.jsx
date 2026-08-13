import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import AdminPage from './AdminPage.jsx';
import Button from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import '../../styles/user_management.css';

const COLUMNS = ['ID', 'Name', 'Email', 'Listings', 'Status'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [tone, setTone] = useState('success');
  const [pending, setPending] = useState(null); // user awaiting ban confirmation
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get('/admin/users')
      .then(({ data }) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function confirmBan() {
    setBusy(true);
    try {
      const { data } = await api.post(`/admin/users/${pending.id}/ban`);
      setTone('success');
      setToast(data.message);
      load();
    } catch (err) {
      setTone('error');
      setToast(errMsg(err));
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <>
      <AdminPage
        title="Users"
        description="Everyone registered on PropertyFinder."
        columns={COLUMNS}
        rows={users}
        loading={loading}
        emptyText="No users found."
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
              {u.status !== 0 ? (
                <span className="pf-badge pf-badge--danger">Banned</span>
              ) : u.role === 1 ? (
                <span className="pf-badge pf-badge--brand">Admin</span>
              ) : (
                <Button variant="danger-quiet" size="sm" icon="ban" onClick={() => setPending(u)}>
                  Ban
                </Button>
              )}
            </td>
          </tr>
        )}
      />

      {/* Banning also deletes every listing the account owns, so the dialog says
          so plainly rather than asking "are you sure?" about an unnamed action. */}
      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirmBan}
        busy={busy}
        title={pending ? `Ban ${pending.firstname} ${pending.lastname}?` : ''}
        description="Their account will be suspended and every property they have listed will be deleted, along with any reports against them."
        confirmLabel="Ban and delete listings"
        cancelLabel="Cancel"
      />
    </>
  );
}

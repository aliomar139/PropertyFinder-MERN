import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import AdminPage from './AdminPage.jsx';
import Button from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import '../../styles/reports.css';

const COLUMNS = ['ID', 'Reported by', 'Owner', 'Listing', 'Reason', 'Action'];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [tone, setTone] = useState('success');

  const load = () =>
    api
      .get('/reports')
      .then(({ data }) => setReports(data.reports))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function dismiss() {
    setBusy(true);
    try {
      await api.delete(`/reports/${pending.id}`);
      setTone('success');
      setToast('Report dismissed.');
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
        title="Reports"
        description="Listings that users have flagged. Open the listing to judge the complaint before acting."
        columns={COLUMNS}
        rows={reports}
        loading={loading}
        emptyText="No open reports. Nothing needs your attention."
        toast={toast}
        toastTone={tone}
        onToastDismiss={() => setToast('')}
        renderRow={(r) => (
          <tr key={r.id}>
            <td className="pf-table__id">{r.id.slice(-6)}</td>
            <td>
              {r.reportingUser ? (
                <Link to={`/users/${r.reportingUser.id}`}>
                  {r.reportingUser.firstname} {r.reportingUser.lastname}
                </Link>
              ) : (
                <span className="pf-muted">—</span>
              )}
            </td>
            <td>
              {r.reportedUser ? (
                <Link to={`/users/${r.reportedUser.id}`}>
                  {r.reportedUser.firstname} {r.reportedUser.lastname}
                </Link>
              ) : (
                <span className="pf-muted">—</span>
              )}
            </td>
            <td>
              <Link to={`/property/${r.property.id}`}>Open listing</Link>
            </td>
            <td className="admin__reason">{r.reason}</td>
            <td>
              <Button variant="ghost" size="sm" icon="x" onClick={() => setPending(r)}>
                Dismiss
              </Button>
            </td>
          </tr>
        )}
      />

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={dismiss}
        busy={busy}
        title="Dismiss this report?"
        description="The report is deleted and the listing stays published. The person who reported it is not notified."
        confirmLabel="Dismiss report"
        cancelLabel="Keep it"
      />
    </>
  );
}

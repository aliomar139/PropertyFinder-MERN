import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../../api/client';
import AdminPage from './AdminPage.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import '../../styles/all_verify.css';

const COLUMNS = ['ID', 'Name', 'Email', 'Document', 'Decision'];

export default function VerifyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');
  const [tone, setTone] = useState('success');

  const load = () =>
    api
      .get('/verifications/pending')
      .then(({ data }) => setRequests(data.requests))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function act(id, action) {
    setBusyId(`${id}:${action}`);
    try {
      const { data } = await api.put(`/verifications/${id}/${action}`);
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
      title="Verification requests"
      description="Open each document before deciding. Approving adds a verified badge to every listing that person publishes."
      columns={COLUMNS}
      rows={requests}
      loading={loading}
      emptyText="No requests are waiting for review."
      toast={toast}
      toastTone={tone}
      onToastDismiss={() => setToast('')}
      renderRow={(r) => (
        <tr key={r.id}>
          <td className="pf-table__id">{r.id.slice(-6)}</td>
          <td>
            <Link to={`/users/${r.user.id}`} className="pf-table__primary">
              {r.user.firstname} {r.user.lastname}
            </Link>
          </td>
          <td>{r.user.email}</td>
          <td>
            <a
              className="admin__doc-link"
              href={imageUrl(r.idDocumentPath)}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="fileText" size={15} />
              View document
              <span className="pf-sr-only"> (opens in a new tab)</span>
            </a>
          </td>
          <td>
            <div className="pf-table__actions">
              <Button
                variant="primary"
                size="sm"
                icon="check"
                loading={busyId === `${r.id}:approve`}
                disabled={busyId?.startsWith(r.id)}
                onClick={() => act(r.id, 'approve')}
              >
                Approve
              </Button>
              <Button
                variant="danger-quiet"
                size="sm"
                icon="x"
                loading={busyId === `${r.id}:reject`}
                disabled={busyId?.startsWith(r.id)}
                onClick={() => act(r.id, 'reject')}
              >
                Reject
              </Button>
            </div>
          </td>
        </tr>
      )}
    />
  );
}

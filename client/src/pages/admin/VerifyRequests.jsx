import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../../api/client';
import AdminNavbar from './AdminNavbar.jsx';
import '../../styles/all_verify.css';

// all_verify.php — pending verification requests with Approve / Reject
export default function VerifyRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  const load = () => api.get('/verifications/pending').then(({ data }) => setRequests(data.requests)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function act(id, action) {
    try {
      const { data } = await api.put(`/verifications/${id}/${action}`);
      setMessage(data.message);
      load();
    } catch (err) {
      setMessage(errMsg(err));
    }
  }

  return (
    <div className="page-all-verify">
      {message && (
        <div style={{ padding: 15, backgroundColor: '#4caf50', color: 'white', borderRadius: 5, textAlign: 'center', marginBottom: 20 }}>
          {message}
        </div>
      )}
      <AdminNavbar />
      <div className="content">
        <table className="verification-table">
          <thead>
            <tr>
              <th>Request ID</th><th>Full Name</th><th>Email</th><th>Document</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length ? requests.map((r) => (
              <tr key={r.id}>
                <td>{r.id.slice(-6)}</td>
                <td>
                  <div className="title">
                    <Link to={`/users/${r.user.id}`} className="view-details-link">
                      {r.user.firstname} {r.user.lastname}
                    </Link>
                  </div>
                </td>
                <td>{r.user.email}</td>
                <td>
                  <a href={imageUrl(r.idDocumentPath)} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>
                    View Document
                  </a>
                </td>
                <td>
                  <button className="approve-btn" style={{ backgroundColor: '#28a745' }} onClick={() => act(r.id, 'approve')}>Approve</button>
                  <button className="reject-btn" style={{ backgroundColor: '#e74c3c' }} onClick={() => act(r.id, 'reject')}>Reject</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No pending verification requests found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

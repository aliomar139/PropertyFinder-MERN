import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import '../styles/verify_req.css';

// verify_req.php — upload an ID document to request account verification
export default function VerifyRequest() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please upload a document.');
      return;
    }
    const fd = new FormData();
    fd.append('id_document', file);
    try {
      await api.post('/verifications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/user');
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="page-verify">
    <div className="verify-container">
      <div className="logo">PropertyFinder</div>
      <form className="verify-form" onSubmit={handleSubmit}>
        <h2>Verify Your Account</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <label htmlFor="id_document">Upload ID Document</label>
          <input type="file" id="id_document" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit">Submit Verification</button>
      </form>
    </div>
    </div>
  );
}

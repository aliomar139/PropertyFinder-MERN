import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Alert } from '../components/ui/Feedback.jsx';
import { Wordmark } from '../components/AppBar.jsx';
import '../styles/auth.css';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function VerifyRequest() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Choose a document to upload first.');
      return;
    }
    const fd = new FormData();
    fd.append('id_document', file);
    setBusy(true);
    try {
      await api.post('/verifications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/user');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-verify pf-auth">
      <main id="main" className="pf-auth__card">
        <Wordmark to="/home" className="pf-auth__brand" />
        <h1 className="pf-auth__title">Get verified</h1>
        <p className="pf-auth__sub">
          Upload a government ID so an admin can confirm who you are. Verified owners get a badge
          on every listing they publish.
        </p>

        <form className="pf-auth__form" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}

          <div className="pf-field">
            <span className="pf-label" id="doc-label">
              Identity document
              <span className="pf-label__req" aria-hidden="true">
                *
              </span>
            </span>

            <label className="pf-filedrop" htmlFor="id_document">
              <span className="pf-filedrop__icon">
                <Icon name={file ? 'fileText' : 'upload'} size={19} />
              </span>
              <span className="pf-filedrop__text">
                <span className="pf-filedrop__name">
                  {file ? file.name : 'Choose a file'}
                </span>
                <span className="pf-filedrop__meta">
                  {file ? formatSize(file.size) : 'A photo or scan of your ID, passport or licence.'}
                </span>
              </span>
              <input
                id="id_document"
                type="file"
                accept="image/*,application/pdf"
                required
                aria-describedby="doc-label"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError('');
                }}
              />
            </label>
          </div>

          <Alert tone="info">
            Your document is only used to confirm your identity. It is never shown on your public
            profile or shared with other users.
          </Alert>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={busy}
            loadingLabel="Uploading…"
            disabled={!file}
          >
            Submit for review
          </Button>
        </form>

        <div className="pf-auth__foot">
          <span>Changed your mind?</span>
          <Link to="/user">Back to your profile</Link>
        </div>
      </main>
    </div>
  );
}

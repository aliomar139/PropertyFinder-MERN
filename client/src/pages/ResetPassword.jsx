import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import Button from '../components/ui/Button.jsx';
import { TextField } from '../components/ui/Field.jsx';
import { Alert } from '../components/ui/Feedback.jsx';
import { Wordmark } from '../components/AppBar.jsx';
import Steps from '../components/ui/Steps.jsx';
import '../styles/auth.css';

/* Step 1 of 2 in the password reset flow: request a code by email. */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // The original redirected after a bare 2s timer with no way to skip. The
  // success state now says what will happen and offers the link immediately.
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => navigate('/change-pass'), 2000);
    return () => clearTimeout(t);
  }, [message, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSending(true);
    try {
      const { data } = await api.post('/auth/reset-code', { email });
      sessionStorage.setItem('resetEmail', email);
      setMessage(data.message);
    } catch (err) {
      setError(errMsg(err, 'We could not send a code to that address.'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-login pf-auth">
      <main id="main" className="pf-auth__card">
        <Wordmark to="/" className="pf-auth__brand" />
        <h1 className="pf-auth__title">Reset your password</h1>
        <p className="pf-auth__sub">
          We will email you a six-digit code. It is valid for a short while, so keep this tab open.
        </p>
        <Steps current={1} labels={['Request code', 'Set new password']} />

        <form className="pf-auth__form" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}
          {message && (
            <Alert tone="success">
              {message} Taking you to the next step — or{' '}
              <Link to="/change-pass">continue now</Link>.
            </Alert>
          )}

          <TextField
            label="Email"
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={sending}
            loadingLabel="Sending code…"
            disabled={!!message}
          >
            Email me a code
          </Button>
        </form>

        <div className="pf-auth__foot">
          <span>Remembered it?</span>
          <Link to="/login">Back to sign in</Link>
        </div>
      </main>
    </div>
  );
}

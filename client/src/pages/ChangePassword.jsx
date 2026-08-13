import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Button, { IconButton } from '../components/ui/Button.jsx';
import Field, { TextField } from '../components/ui/Field.jsx';
import { Alert } from '../components/ui/Feedback.jsx';
import { Wordmark } from '../components/AppBar.jsx';
import Steps from '../components/ui/Steps.jsx';
import '../styles/auth.css';

/* Step 2 of 2: confirm the emailed code, then set a new password. */
export default function ChangePassword() {
  const navigate = useNavigate();
  const { setFlash } = useAuth();
  const email = sessionStorage.getItem('resetEmail');
  const [code, setCode] = useState('');
  const [validated, setValidated] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!email) return <Navigate to="/reset" replace />;

  async function submitCode(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/verify-reset-code', { email, code });
      setValidated(true);
    } catch (err) {
      setError(errMsg(err, 'That code did not match. Check the email and try again.'));
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    setError('');
    setFieldError('');
    if (newPassword.length < 8) {
      setFieldError('Use at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email,
        code,
        newPassword,
        confirmPassword
      });
      sessionStorage.removeItem('resetEmail');
      setFlash(data.message);
      navigate('/login');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-login pf-auth">
      <main id="main" className="pf-auth__card">
        <Wordmark to="/" className="pf-auth__brand" />

        {!validated ? (
          <>
            <h1 className="pf-auth__title">Enter your code</h1>
            <p className="pf-auth__sub">
              We sent a six-digit code to <strong>{email}</strong>.
            </p>
            <Steps current={1} labels={['Confirm code', 'New password']} />

            <form className="pf-auth__form" onSubmit={submitCode}>
              {error && <Alert tone="error">{error}</Alert>}
              <Field label="Reset code" id="code" required>
                {(a11y) => (
                  <input
                    className="pf-input pf-code-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    {...a11y}
                  />
                )}
              </Field>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                block
                loading={busy}
                loadingLabel="Checking…"
                disabled={code.length < 6}
              >
                Continue
              </Button>
            </form>

            <div className="pf-auth__foot">
              <span>Nothing arrived?</span>
              <Link to="/reset">Send a new code</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="pf-auth__title">Choose a new password</h1>
            <p className="pf-auth__sub">You will use this to sign in from now on.</p>
            <Steps current={2} labels={['Confirm code', 'New password']} />

            <form className="pf-auth__form" onSubmit={submitPassword}>
              {error && <Alert tone="error">{error}</Alert>}

              <Field
                label="New password"
                id="new-password"
                required
                hint="At least 8 characters."
                error={fieldError && newPassword.length < 8 ? fieldError : undefined}
              >
                {(a11y) => (
                  <div className="pf-input-affix">
                    <input
                      className="pf-input"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      {...a11y}
                    />
                    <IconButton
                      className="pf-input-affix__end"
                      label={showPass ? 'Hide password' : 'Show password'}
                      icon={showPass ? 'eyeOff' : 'eye'}
                      aria-pressed={showPass}
                      onClick={() => setShowPass((s) => !s)}
                    />
                  </div>
                )}
              </Field>

              <TextField
                label="Confirm new password"
                id="confirm-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldError && newPassword.length >= 8 ? fieldError : undefined}
              />

              <Button type="submit" variant="primary" size="lg" block loading={busy} loadingLabel="Saving…">
                Save new password
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

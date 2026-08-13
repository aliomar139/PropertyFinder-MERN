import { useState } from 'react';
import api, { errMsg } from '../api/client';
import ProfileNavbar from '../components/ProfileNavbar.jsx';
import Button, { IconButton } from '../components/ui/Button.jsx';
import Field, { TextField } from '../components/ui/Field.jsx';
import { Alert, Toast } from '../components/ui/Feedback.jsx';
import '../styles/user.css';

export default function UserChangePass() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errs = {};
    if (newPassword.length < 8) errs.newPassword = 'Use at least 8 characters.';
    else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'The two passwords do not match.';
    } else if (newPassword === oldPassword) {
      errs.newPassword = 'Choose something different from your current password.';
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      setToast(data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-userchange">
      <ProfileNavbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container userpass">
          <header className="pf-page-head userpass__intro">
            <div>
              <h1 className="pf-page-head__title">Change your password</h1>
              <p className="pf-page-head__sub">
                You will stay signed in on this device after saving.
              </p>
            </div>
          </header>

          <form className="userpass__form pf-card" onSubmit={handleSubmit}>
            {error && <Alert tone="error">{error}</Alert>}

            <TextField
              label="Current password"
              id="oldPassword"
              type="password"
              autoComplete="current-password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <Field
              label="New password"
              id="newPassword"
              required
              hint="At least 8 characters."
              error={fieldErrors.newPassword}
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
              id="confirmPassword"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
            />

            <div className="profile__actions">
              <Button type="submit" variant="primary" loading={busy} loadingLabel="Saving…">
                Save new password
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Toast message={toast} tone="success" onDismiss={() => setToast('')} />
    </div>
  );
}

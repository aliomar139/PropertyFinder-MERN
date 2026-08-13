import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import ProfileNavbar from '../components/ProfileNavbar.jsx';
import Button from '../components/ui/Button.jsx';
import Field, { TextField } from '../components/ui/Field.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Alert, Toast } from '../components/ui/Feedback.jsx';
import '../styles/user.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInput = useRef();

  const [form, setForm] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phone: user.number,
  });
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [numberError, setNumberError] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function pickPicture(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNumberError('');
    if (form.phone.replace(/\D/g, '').length !== 8) {
      setNumberError('Lebanese numbers are 8 digits.');
      document.getElementById('phone')?.focus();
      return;
    }
    const fd = new FormData();
    fd.append('firstname', form.firstname);
    fd.append('lastname', form.lastname);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    if (picture) fd.append('profile_picture', picture);

    setBusy(true);
    try {
      const { data } = await api.put('/users/me', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      setPicture(null);
      setToast('Profile updated.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  const verified = user.verify === 1;

  return (
    <div className="page-user">
      <ProfileNavbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container profile">
          <header className="pf-page-head">
            <div>
              <h1 className="pf-page-head__title">Your profile</h1>
              <p className="pf-page-head__sub">
                This is what other people see when they open one of your listings.
              </p>
            </div>
          </header>

          <div className="profile__layout">
            {/* Identity card: avatar, name, verification status. */}
            <aside className="profile__identity pf-card">
              <button
                type="button"
                className="profile__avatar"
                onClick={() => fileInput.current?.click()}
                aria-label="Change your profile photo"
              >
                <img src={preview || imageUrl(user.profile)} alt="" width="112" height="112" />
                <span className="profile__avatar-badge" aria-hidden="true">
                  <Icon name="pencil" size={14} />
                </span>
              </button>
              <input
                type="file"
                ref={fileInput}
                accept="image/*"
                onChange={pickPicture}
                className="pf-sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />

              <p className="profile__name">
                {user.firstname} {user.lastname}
              </p>

              {verified ? (
                <span className="pf-badge pf-badge--success">
                  <Icon name="badgeCheck" size={14} />
                  Verified owner
                </span>
              ) : (
                <>
                  <span className="pf-badge pf-badge--neutral">Not verified</span>
                  <p className="pf-caption profile__verify-copy">
                    Verified owners are marked with a badge on every listing, which helps people
                    trust what they are looking at.
                  </p>
                  <Button variant="secondary" icon="badgeCheck" onClick={() => navigate('/verify')}>
                    Get verified
                  </Button>
                </>
              )}

              {picture && (
                <p className="pf-caption profile__pending">
                  New photo selected — save to apply it.
                </p>
              )}
            </aside>

            <form className="profile__form pf-card" onSubmit={handleSubmit}>
              <h2 className="profile__form-title">Details</h2>
              {error && <Alert tone="error">{error}</Alert>}

              <div className="profile__grid">
                <TextField
                  label="First name"
                  id="firstname"
                  autoComplete="given-name"
                  required
                  value={form.firstname}
                  onChange={set('firstname')}
                />
                <TextField
                  label="Last name"
                  id="lastname"
                  autoComplete="family-name"
                  required
                  value={form.lastname}
                  onChange={set('lastname')}
                />
              </div>

              <TextField
                label="Email"
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
              />

              <Field label="Phone" id="phone" required error={numberError} hint="8 digits.">
                {(a11y) => (
                  <div className="pf-input-group">
                    <span className="pf-input-group__prefix" aria-hidden="true">
                      +961
                    </span>
                    <input
                      className="pf-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={8}
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 8),
                        }))
                      }
                      {...a11y}
                    />
                  </div>
                )}
              </Field>

              <div className="profile__actions">
                <Button type="submit" variant="primary" loading={busy} loadingLabel="Saving…">
                  Save changes
                </Button>
                <Button variant="ghost" icon="key" onClick={() => navigate('/user/change-pass')}>
                  Change password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Toast message={toast} tone="success" onDismiss={() => setToast('')} />
    </div>
  );
}

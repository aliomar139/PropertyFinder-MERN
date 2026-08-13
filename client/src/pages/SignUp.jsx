import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Button, { IconButton } from '../components/ui/Button.jsx';
import Field, { TextField } from '../components/ui/Field.jsx';
import { Alert } from '../components/ui/Feedback.jsx';
import { Wordmark } from '../components/AppBar.jsx';
import '../styles/auth.css';

const EMPTY = {
  firstname: '',
  lastname: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: ''
};

/* Field-level rules live in one place, so blur-time validation and submit-time
   validation can never disagree with each other. */
function validate(form) {
  const e = {};
  if (!form.firstname.trim()) e.firstname = 'Enter your first name.';
  if (!form.lastname.trim()) e.lastname = 'Enter your last name.';
  if (form.phoneNumber.length !== 8) {
    e.phoneNumber = `Lebanese numbers are 8 digits — you have entered ${form.phoneNumber.length}.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
  if (form.password.length < 8) e.password = 'Use at least 8 characters.';
  if (form.confirmPassword && form.password !== form.confirmPassword) {
    e.confirmPassword = 'This does not match the password above.';
  }
  return e;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { setFlash } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const errors = validate(form);
  // Validate on blur, not on every keystroke: telling someone their email is
  // invalid while they are still typing it is noise, not help.
  const shown = (k) => (touched[k] ? errors[k] : undefined);
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
      // Move focus to the first thing that needs fixing.
      const first = Object.keys(errors)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      setFlash(data.message);
      navigate('/login');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-signup pf-auth">
      <main id="main" className="pf-auth__card pf-auth__card--wide">
        <Wordmark to="/" className="pf-auth__brand" />
        <h1 className="pf-auth__title">Create your account</h1>
        <p className="pf-auth__sub">
          You will be able to save favourites straight away, and list a property once you are
          signed in.
        </p>

        <form className="pf-auth__form" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}

          <div className="pf-auth__row">
            <TextField
              label="First name"
              id="firstname"
              autoComplete="given-name"
              placeholder="Sara"
              required
              value={form.firstname}
              onChange={set('firstname')}
              onBlur={blur('firstname')}
              error={shown('firstname')}
            />
            <TextField
              label="Last name"
              id="lastname"
              autoComplete="family-name"
              placeholder="Khoury"
              required
              value={form.lastname}
              onChange={set('lastname')}
              onBlur={blur('lastname')}
              error={shown('lastname')}
            />
          </div>

          <Field
            label="Phone number"
            id="phoneNumber"
            required
            hint="8 digits, without the leading zero."
            error={shown('phoneNumber')}
          >
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
                  placeholder="71 234 567"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 8) }))
                  }
                  onBlur={blur('phoneNumber')}
                  aria-label="Phone number, Lebanon country code plus 961"
                  {...a11y}
                />
              </div>
            )}
          </Field>

          <TextField
            label="Email"
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={set('email')}
            onBlur={blur('email')}
            error={shown('email')}
          />

          <div className="pf-auth__row">
            <Field
              label="Password"
              id="password"
              required
              hint="At least 8 characters."
              error={shown('password')}
            >
              {(a11y) => (
                <div className="pf-input-affix">
                  <input
                    className="pf-input"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
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
              label="Confirm password"
              id="confirmPassword"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              onBlur={blur('confirmPassword')}
              error={shown('confirmPassword')}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" block loading={busy} loadingLabel="Creating account…">
            Create account
          </Button>
        </form>

        <div className="pf-auth__foot">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </main>
    </div>
  );
}

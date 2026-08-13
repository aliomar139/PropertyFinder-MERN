import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Button, { IconButton } from '../components/ui/Button.jsx';
import Field, { TextField } from '../components/ui/Field.jsx';
import { Alert } from '../components/ui/Feedback.jsx';
import { Wordmark } from '../components/AppBar.jsx';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, flash, setFlash } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const emailRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setFlash('');
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setError(errMsg(err, 'That email and password combination did not match an account.'));
      // Send focus back to the first field so recovery is one keystroke away.
      emailRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-login pf-auth">
      <main id="main" className="pf-auth__card">
        <Wordmark to="/" className="pf-auth__brand" />
        <h1 className="pf-auth__title">Sign in</h1>
        <p className="pf-auth__sub">Pick up where you left off with your listings and favourites.</p>

        <form className="pf-auth__form" onSubmit={handleSubmit} noValidate={false}>
          {flash && <Alert tone="success">{flash}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          <TextField
            label="Email"
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            inputRef={emailRef}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Field label="Password" id="password" required>
            {(a11y) => (
              <div className="pf-input-affix">
                <input
                  className="pf-input"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  {...a11y}
                />
                {/* A real button, not a bare <img onClick>: focusable, labelled,
                    and its state is exposed through aria-pressed. */}
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

          <Button type="submit" variant="primary" size="lg" block loading={busy} loadingLabel="Signing in…">
            Sign in
          </Button>

          <p style={{ textAlign: 'right', fontSize: 'var(--text-body-sm)' }}>
            <Link to="/reset">Forgotten your password?</Link>
          </p>
        </form>

        <div className="pf-auth__foot">
          <span>New to PropertyFinder?</span>
          <Link to="/signup">Create an account</Link>
        </div>
      </main>
    </div>
  );
}

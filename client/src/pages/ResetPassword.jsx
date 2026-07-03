import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import '../styles/login.css';

// reset.php — request a 6-digit code by email, then continue to /change-pass
export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage(''); setSending(true);
    try {
      const { data } = await api.post('/auth/reset-code', { email });
      setMessage(data.message);
      sessionStorage.setItem('resetEmail', email);
      setTimeout(() => navigate('/change-pass'), 2000); // same 2s redirect as reset.php
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-login">
    <div className="login-container">
      <div className="logo">PropertyFinder</div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Reset Password'}</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {message && (
          <div className="success-message"
            style={{ backgroundColor: '#4CAF50', color: 'white', padding: 10, marginTop: 20, borderRadius: 5 }}>
            {message}
          </div>
        )}
      </form>
    </div>
    </div>
  );
}

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/login.css';

// change-pass.php — step 1: enter the emailed code; step 2: set a new password
export default function ChangePassword() {
  const navigate = useNavigate();
  const { setFlash } = useAuth();
  const email = sessionStorage.getItem('resetEmail');
  const [code, setCode] = useState('');
  const [validated, setValidated] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!email) return <Navigate to="/reset" replace />;

  async function submitCode(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/verify-reset-code', { email, code });
      setValidated(true);
    } catch (err) {
      setError(errMsg(err, 'The code you entered is incorrect.'));
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const { data } = await api.post('/auth/reset-password', { email, code, newPassword, confirmPassword });
      sessionStorage.removeItem('resetEmail');
      setFlash(data.message); // "Your password was changed successfully!"
      navigate('/login');
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="page-login">
    <div className="login-container">
      <div className="logo">PropertyFinder</div>
      {!validated ? (
        <form className="login-form" onSubmit={submitCode}>
          <h2>Enter Reset Code</h2>
          <div className="input-group">
            <label htmlFor="code">Reset Code</label>
            <input type="text" id="code" placeholder="Enter The Code" required
              value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button type="submit">Submit Code</button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
      ) : (
        <form className="login-form" onSubmit={submitPassword}>
          <h2>Enter New Password</h2>
          <div className="input-group">
            <label htmlFor="new-password">New Password</label>
            <input type="password" id="new-password" placeholder="Enter New Password" required
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" placeholder="Confirm New Password" required
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit">Change Password</button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
      )}
    </div>
    </div>
  );
}

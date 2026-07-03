import { useState } from 'react';
import api, { errMsg } from '../api/client';
import ProfileNavbar from '../components/ProfileNavbar.jsx';
import '../styles/userchange-pass.css';

// userchange-pass.php — change password while logged in (requires old password)
export default function UserChangePass() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const { data } = await api.post('/auth/change-password', { oldPassword, newPassword, confirmPassword });
      setSuccess(` ✅ ${data.message}`);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="page-userchange">
      <ProfileNavbar />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Enter old Password</h2>
          <div className="input-group">
            <label htmlFor="oldpass">Old Password</label>
            <input type="password" id="oldpass" placeholder="Enter Old Password" required
              value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </div>
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
          <div id="password-error" style={{ color: 'red' }}>
            {error && <p>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
          </div>
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}

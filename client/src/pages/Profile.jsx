import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import ProfileNavbar from '../components/ProfileNavbar.jsx';
import '../styles/user.css';

// user.php — editable profile with picture upload + "Verify Me" button
export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInput = useRef();

  const [form, setForm] = useState({
    firstname: user.firstname, lastname: user.lastname, email: user.email, phone: user.number
  });
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [numberError, setNumberError] = useState('');
  const [message, setMessage] = useState('');

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
    setMessage(''); setNumberError('');
    if (form.phone.replace(/\D/g, '').length !== 8) {
      setNumberError('Phone number must be exactly 8 digits.');
      return;
    }
    const fd = new FormData();
    fd.append('firstname', form.firstname);
    fd.append('lastname', form.lastname);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    if (picture) fd.append('profile_picture', picture);

    try {
      const { data } = await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      setMessage('✅ Profile updated successfully!');
    } catch (err) {
      setMessage(errMsg(err));
    }
  }

  return (
    <div className="page-user">
      <ProfileNavbar />
      <form onSubmit={handleSubmit}>
        <div className="profile-container">
          <img
            id="profile-pic"
            src={preview || imageUrl(user.profile)}
            alt="Profile"
            className="profile-pic"
            onClick={() => fileInput.current?.click()}
          />
          <input
            type="file" ref={fileInput} className="custom-file-upload" accept="image/*"
            onChange={pickPicture} style={{ display: 'none' }}
          />

          <h2>{user.firstname} {user.lastname}</h2>

          <div className="profile-info">
            <p><strong>First Name:</strong>
              <input id="firstname" className="editable" value={form.firstname} onChange={set('firstname')} required />
            </p>
            <p><strong>Last Name:</strong>
              <input id="lastname" className="editable" value={form.lastname} onChange={set('lastname')} required />
            </p>
            <p><strong>Email:</strong>
              <input id="email" className="editable" value={form.email} onChange={set('email')} />
            </p>
            <p><strong>Phone:</strong>
              <input id="phone" className="editable" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, '') }))} />
            </p>
            <span id="number-error" style={{ color: 'red' }}>{numberError}</span>
          </div>

          <div>
            <button type="submit">Confirm</button>
            {message && <div>{message}</div>}
            {user.verify === 0 && (
              <button type="button" onClick={() => navigate('/verify')}>Verify Me</button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

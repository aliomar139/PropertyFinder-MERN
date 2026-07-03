import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/signup.css';

// signUp.php — same validation: 8-digit phone (+961 prefix), password ≥ 8 chars, match check
export default function SignUp() {
  const navigate = useNavigate();
  const { setFlash } = useAuth();
  const [form, setForm] = useState({
    firstname: '', lastname: '', phoneNumber: '', email: '', password: '', confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [numberError, setNumberError] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setPasswordError(''); setNumberError(''); setError('');

    let valid = true;
    if (form.password.length < 8) {
      setPasswordError('Password should be at least 8 characters.'); valid = false;
    } else if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords don't match. Please try again!"); valid = false;
    }
    if (form.phoneNumber.length !== 8) {
      setNumberError('Phone number should be exactly 8 digits.'); valid = false;
    }
    if (!valid) return;

    try {
      const { data } = await api.post('/auth/signup', form);
      setFlash(data.message); // "Your account has been created. Please log in to continue."
      navigate('/login');
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="page-signup">
    <div className="signup-container">
      <div className="logo">PropertyFinder</div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <div style={{ color: 'red' }} className="error-message">{error}</div>}
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="firstname">First Name</label>
            <input type="text" id="firstname" placeholder="Enter your first name" required
              value={form.firstname} onChange={set('firstname')} />
          </div>
          <div className="input-group">
            <label htmlFor="lastname">Last Name</label>
            <input type="text" id="lastname" placeholder="Enter your last name" required
              value={form.lastname} onChange={set('lastname')} />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="phone-number">Phone Number</label>
          <div className="phone-wrapper">
            <input type="text" id="country-code" value="+961" disabled />
            <input type="tel" id="phone-number" placeholder="Enter your phone number" required
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/[^0-9]/g, '') }))} />
          </div>
          <div id="number-error" style={{ color: 'red' }}>{numberError}</div>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required
            value={form.email} onChange={set('email')} />
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input type="password" id="password" placeholder="Enter your password" required
                value={form.password} onChange={set('password')} />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="password-wrapper">
              <input type="password" id="confirm-password" placeholder="Confirm your password" required
                value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>
          </div>
        </div>
        <div id="password-error" style={{ color: 'red' }}>{passwordError}</div>
        <button type="submit">Sign Up</button>
      </form>
      <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
    </div>
    </div>
  );
}

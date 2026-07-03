import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/login.css';

// login.php — incl. flash message from signup/logout/password-change and show/hide password toggle
export default function Login() {
  const navigate = useNavigate();
  const { login, flash, setFlash } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setFlash('');
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setError(errMsg(err, 'Invalid Login Details!'));
    }
  }

  return (
    <div className="page-login">
    <div className="login-container">
      <div className="logo">PropertyFinder</div>
      <form name="loginpage" className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {flash && <div className="success-message">{flash}</div>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input type={showPass ? 'text' : 'password'} id="password" placeholder="Enter your password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <img
              src={showPass ? '/pictures/hide-pass.png' : '/pictures/show-pass.png'}
              id="toggleIcon"
              alt={showPass ? 'Hide Password' : 'Show Password'}
              onClick={() => setShowPass((s) => !s)}
            />
          </div>
        </div>
        <button type="submit">Login</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
      <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      <p className="reset-link"><Link to="/reset">Forgotten Password?</Link></p>
    </div>
    </div>
  );
}

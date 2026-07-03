import { useNavigate, useLocation } from 'react-router-dom';

// The simpler navbar used by user.php / userchange-pass.php
export default function ProfileNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cls = (to) => (pathname === to ? 'nav-button active' : 'nav-button');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className={cls('/home')} id="home" onClick={() => navigate('/home')}>Home</button>
        <button className={cls('/user')} id="profile" onClick={() => navigate('/user')}>Profile</button>
        <button className={cls('/user/change-pass')} id="passedit" onClick={() => navigate('/user/change-pass')}>Edit password</button>
      </div>
    </nav>
  );
}

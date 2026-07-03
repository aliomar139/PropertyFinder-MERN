import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// The navbar from home.php / favorites.php / my-propreties.php,
// including the logout confirmation modal. Whole buttons navigate
// (the PHP pages attached click JS to the buttons, not just the links).
export default function Navbar({ showLogout = true }) {
  const { user, logout, setFlash } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showModal, setShowModal] = useState(false);

  const cls = (to) => (pathname === to ? 'nav-button active' : 'nav-button');
  const linkStyle = { color: 'white', textDecoration: 'none' };

  function confirmLogout() {
    setFlash('Logout Successfully!');
    logout();
    navigate('/login');
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <button type="button" className={cls('/home')} id="all" onClick={() => navigate('/home')}>
            <span style={linkStyle}>Home</span>
          </button>
          {user?.role === 1 && (
            <button type="button" className={cls('/admin')} onClick={() => navigate('/admin')}>
              <span style={linkStyle}>Admin</span>
            </button>
          )}
          {user?.role === 0 && (
            <>
              <button type="button" className={cls('/user')} onClick={() => navigate('/user')}>
                <span style={linkStyle}>User</span>
              </button>
              <button type="button" className={cls('/my-properties')} onClick={() => navigate('/my-properties')}>
                <span style={linkStyle}>My Propreties</span>
              </button>
              <button type="button" className={cls('/favorites')} id="favorites" onClick={() => navigate('/favorites')}>
                <span style={linkStyle}>Favorites</span>
              </button>
            </>
          )}
          {showLogout && (
            <button type="button" className="nav-button" id="logout" onClick={() => setShowModal(true)}>Log Out</button>
          )}
        </div>
        <div className="logo">
          <h2>Property<span className="yellow">Finder</span></h2>
        </div>
      </nav>

      {showModal && (
        <div id="logout-modal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h3>Are you sure you want to log out?</h3>
            <button type="button" id="confirm-logout" onClick={confirmLogout}>Yes</button>
            <button type="button" id="cancel-logout" onClick={() => setShowModal(false)}>No</button>
          </div>
        </div>
      )}
    </>
  );
}

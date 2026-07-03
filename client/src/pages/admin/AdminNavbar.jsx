import { useNavigate, useLocation } from 'react-router-dom';

// The Home/Admin navbar shared by the admin pages. Whole buttons navigate
// (matches the click JS in admin.php).
export default function AdminNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const linkStyle = { color: 'white', textDecoration: 'none' };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button type="button" className="nav-button" onClick={() => navigate('/home')}>
          <span style={linkStyle}>Home</span>
        </button>
        <button
          type="button"
          className={pathname.startsWith('/admin') ? 'nav-button active' : 'nav-button'}
          onClick={() => navigate('/admin')}
        >
          <span style={linkStyle}>Admin</span>
        </button>
      </div>
      <div className="logo">
        <h2>Property<span className="yellow">Finder</span></h2>
      </div>
    </nav>
  );
}

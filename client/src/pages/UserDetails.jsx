import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import '../styles/user_details.css';

// user_details.php — public owner profile with verified badge + their listings
export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(errMsg(err, 'User not found.')));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!data) return null;
  const { user, propertyCount, properties } = data;

  return (
    <div className="page-user-details">
      <nav className="navbar">
        <div className="navbar-container">
          <button type="button" className="nav-button" id="all" onClick={() => navigate('/home')}>
            <span style={{ color: 'white', textDecoration: 'none' }}>Home</span>
          </button>
          {me.role === 1 && (
            <button type="button" className="nav-button" onClick={() => navigate('/admin')}>
              <span style={{ color: 'white', textDecoration: 'none' }}>Admin</span>
            </button>
          )}
        </div>
        <div className="logo">
          <h2>Property<span className="yellow">Finder</span></h2>
        </div>
      </nav>

      <div className="content">
        <div className="top-section">
          <div className="user-details">
            <h2>User Details</h2>
            <p>
              <strong>Name:</strong> {user.firstname} {user.lastname}
              {user.verify === 1 && (
                <span className="verified-badge">
                  <img src="/pictures/icons8-verified-badge-96.png" alt="Verified"
                    style={{ width: 20, height: 20, verticalAlign: 'middle' }} />
                </span>
              )}
            </p>
            <p><strong>Properties Count:</strong> {propertyCount}</p>
          </div>
          <div className="contact-info">
            <h2>Contact Info</h2>
            <p><strong>Email:</strong>{user.email}</p>
            <p><strong>Phone:</strong>{user.number}</p>
          </div>
        </div>

        <h2>Apartments Uploaded</h2>
        <PropertyGrid properties={properties} emptyText="No properties uploaded." />
      </div>
    </div>
  );
}

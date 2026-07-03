import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/property_details.css';

// property_details.php — carousel, favorite toggle, report, owner profile link, edit/delete
export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => { setProperty(data.property); setIsFavorite(data.isFavorite); })
      .catch((err) => setError(errMsg(err, 'Property not found!')));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!property) return null;

  const ownerId = property.owner?._id || property.owner;
  const isOwner = String(ownerId) === String(user.id);
  const isAdmin = user.role === 1;
  const photos = property.images || [];

  async function toggleFavorite() {
    try {
      const { data } = await api.post(`/favorites/${id}/toggle`);
      setIsFavorite(data.isFavorite);
    } catch { /* noop */ }
  }

  async function submitReport(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/reports', { propertyId: id, reason });
      setReportMessage(data.message);
      setShowReason(false);
    } catch (err) {
      setReportMessage(errMsg(err));
    }
  }

  async function deleteProperty() {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      navigate('/home', { state: { message: 'Property deleted successfully' } });
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="page-property-details">
      <nav className="navbar">
        <div className="navbar-container">
          <button type="button" className="nav-button" onClick={() => navigate('/home')}>
            <span style={{ color: 'white', textDecoration: 'none' }}>Home</span>
          </button>
        </div>
        <div className="logo">
          <h2>Property<span className="yellow">Finder</span></h2>
        </div>
      </nav>

      <div className="property-container">
        <div className="property-image">
          <div className="carousel">
            <div className="carousel-images">
              {photos.length ? (
                <div className="carousel-image" style={{ display: 'block' }}>
                  <img src={imageUrl(photos[photoIndex]?.path)} alt="Property" />
                </div>
              ) : (
                <p>No photos available for this property.</p>
              )}
            </div>
            {photos.length > 1 && (
              <>
                <button className="prev-btn" onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}>&#10094;</button>
                <button className="next-btn" onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}>&#10095;</button>
              </>
            )}
          </div>
        </div>

        <div className="property-details">
          {user.role === 0 && !isOwner && (
            <button type="button" className="favorite-btn" onClick={toggleFavorite}>
              <span className={`star ${isFavorite ? 'filled' : ''}`}>&#9733;</span>
              <span className="favorite-message">
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </span>
            </button>
          )}

          <h3>{property.title}</h3>
          <Link to={`/users/${ownerId}`} className="user-details-btn"> Owner's Profile</Link>

          <p>{property.description}</p>
          <p className="price">${Number(property.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>

          {user.role === 0 && !isOwner && (
            <>
              <form onSubmit={submitReport}>
                {!showReason && (
                  <button type="button" className="report-btn" onClick={() => setShowReason(true)}>Report</button>
                )}
                {showReason && (
                  <div id="reason-container" style={{ display: 'block' }}>
                    <textarea
                      placeholder="Please provide a reason for reporting this property."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                    <button type="submit" className="submit-report-btn">Submit Report</button>
                  </div>
                )}
              </form>
              {reportMessage && (
                <div className={`report-message ${reportMessage.includes('success') ? 'success' : 'error'}`}>
                  {reportMessage}
                </div>
              )}
            </>
          )}

          <div className="buttons">
            {isOwner && (
              <button className="edit-btn" onClick={() => navigate(`/property/${id}/edit`)}>Edit Property</button>
            )}
            {(isAdmin || isOwner) && (
              <button type="button" className="delete-btn" onClick={deleteProperty}>Delete Property</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

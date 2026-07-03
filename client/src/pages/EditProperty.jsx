import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import PropertyForm from '../components/PropertyForm.jsx';
import '../styles/editPage.css';

// editproperty-details.php — edit form pre-filled with current values + image slots
export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data.property))
      .catch((err) => setError(errMsg(err, 'No property found.')));
  }, [id]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/properties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/property/${id}`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  }

  // clear_image.php — delete an image slot immediately
  async function handleClearImage(imageId) {
    try {
      const { data } = await api.delete(`/properties/${id}/images/${imageId}`);
      setProperty(data.property);
    } catch (err) {
      setError(errMsg(err));
    }
  }

  if (!property) return <div style={{ padding: '2rem' }}>{error || 'Loading…'}</div>;

  return (
    <div className="page-edit">
      <PropertyForm
        initial={property}
        onSubmit={handleSubmit}
        onClearImage={handleClearImage}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}

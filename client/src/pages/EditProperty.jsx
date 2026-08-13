import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyForm from '../components/PropertyForm.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState, Skeleton } from '../components/ui/Feedback.jsx';
import '../styles/editPage.css';

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api
      .get(`/properties/${id}`)
      .then(({ data }) => setProperty(data.property))
      .catch((err) => setLoadError(errMsg(err, 'We could not find that listing.')));
  }, [id]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/properties/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/property/${id}`);
    } catch (err) {
      setError(errMsg(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClearImage(imageId) {
    try {
      const { data } = await api.delete(`/properties/${id}/images/${imageId}`);
      setProperty(data.property);
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="page-edit">
      <Navbar />
      <main className="pf-below-appbar">
        {loadError ? (
          <EmptyState
            icon="alertCircle"
            title="Listing not found"
            action={
              <Button as={Link} to="/my-properties" variant="primary" icon="arrowLeft">
                Back to my listings
              </Button>
            }
          >
            {loadError}
          </EmptyState>
        ) : !property ? (
          <div className="pform" aria-busy="true">
            <span className="pf-sr-only">Loading listing…</span>
            <Skeleton width="45%" height="2.2rem" />
            <Skeleton height="14rem" radius="var(--r-lg)" />
            <Skeleton height="14rem" radius="var(--r-lg)" />
          </div>
        ) : (
          <PropertyForm
            initial={property}
            onSubmit={handleSubmit}
            onClearImage={handleClearImage}
            submitting={submitting}
            error={error}
            mode="edit"
          />
        )}
      </main>
    </div>
  );
}

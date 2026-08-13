import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyForm from '../components/PropertyForm.jsx';
import '../styles/listPage.css';

export default function ListPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/home', { state: { message: 'Your listing is live.' } });
    } catch (err) {
      setError(errMsg(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-list">
      <Navbar />
      <main className="pf-below-appbar">
        <PropertyForm onSubmit={handleSubmit} submitting={submitting} error={error} mode="create" />
      </main>
    </div>
  );
}

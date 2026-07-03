import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import PropertyForm from '../components/PropertyForm.jsx';
import '../styles/listPage.css';

// listPage.php — create a property listing
export default function ListPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/home', { state: { message: '✅ Property details added successfully!' } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-list">
      <PropertyForm onSubmit={handleSubmit} submitting={submitting} error={error} />
    </div>
  );
}

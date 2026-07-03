import { useEffect, useState } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import '../styles/home.css';

// favorites.php (used home.css in the original too)
export default function Favorites() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    api.get('/favorites').then(({ data }) => setProperties(data.properties)).catch(() => {});
  }, []);

  return (
    <div className="page-home">
      <Navbar showLogout={false} />
      <div className="content">
        <h2>My Favorite Properties</h2>
        <PropertyGrid properties={properties} emptyText="No favorite properties yet." />
      </div>
    </div>
  );
}

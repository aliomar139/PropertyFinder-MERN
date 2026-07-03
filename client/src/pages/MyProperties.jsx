import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import '../styles/home.css';

// my-propreties.php
export default function MyProperties() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    api.get('/properties/mine').then(({ data }) => setProperties(data.properties)).catch(() => {});
  }, []);

  return (
    <div className="page-home">
      <Navbar />
      <div className="content">
        <PropertyGrid properties={properties} />
        <Link to="/list" className="add-property-btn">
          <span className="plus-icon">+</span>
        </Link>
        <footer>
          <p>&copy; 2025 PropertyFinder | All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
}

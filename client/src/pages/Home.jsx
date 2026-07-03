import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import { citiesByGovernorate, governorates } from '../data/locations.js';
import '../styles/home.css';

const initialFilters = {
  type: '', governorate: '', city: '', min_price: '', max_price: '',
  furnished: '', lease_type: '', sort_by: '', sort_order: 'asc'
};

// home.php — filters, sorting, card grid, "+ list property" button, delete popup message
export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [properties, setProperties] = useState([]);
  const [popup, setPopup] = useState(location.state?.message || '');

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== ''));
    api.get('/properties', { params }).then(({ data }) => setProperties(data.properties)).catch(() => {});
  }, [applied]);

  useEffect(() => {
    if (!popup) return;
    const t = setTimeout(() => setPopup(''), 4000);
    return () => clearTimeout(t);
  }, [popup]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const digits = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value.replace(/[^0-9]/g, '') }));
  const cities = citiesByGovernorate[filters.governorate] || [];

  // sort-order labels adapt to the chosen sort, like home.php
  const orderOptions =
    filters.sort_by === 'date'
      ? [['asc', 'Older First'], ['desc', 'Newer First']]
      : filters.sort_by
        ? [['asc', 'Low to High'], ['desc', 'High to Low']]
        : [['', 'Select a filter']];

  return (
    <div className="page-home">
      <Navbar />
      {popup && <div className="delete-success-popup" id="delete-popup">{popup}</div>}
      <div className="content">
        <div className="filter-section">
          <form
            className="filter-form"
            onSubmit={(e) => { e.preventDefault(); setApplied(filters); }}
          >
            <div className="filter-group">
              <label htmlFor="type">Property Type:</label>
              <select id="type" value={filters.type} onChange={set('type')}>
                <option value="">All</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Cabin">Cabin</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="governorate">Governorate:</label>
              <select id="governorate" value={filters.governorate}
                onChange={(e) => setFilters((f) => ({ ...f, governorate: e.target.value, city: '' }))}>
                <option value="">All</option>
                {governorates.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="city">City:</label>
              <select id="city" value={filters.city} onChange={set('city')}>
                <option value="">Select a city</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="min_price">Min Price ($):</label>
              <input type="number" id="min_price" min="0" placeholder="No min"
                value={filters.min_price} onChange={digits('min_price')} />
            </div>
            <div className="filter-group">
              <label htmlFor="max_price">Max Price ($):</label>
              <input type="number" id="max_price" min="0" placeholder="No max"
                value={filters.max_price} onChange={digits('max_price')} />
            </div>
            <div className="filter-group">
              <button type="submit" className="apply-filters-btn">Apply Filters</button>
            </div>

            <div style={{ display: 'flex', gap: '7%', alignItems: 'flex-end' }}>
              <div className="filter-group">
                <label htmlFor="furnished">Furnished</label>
                <select id="furnished" value={filters.furnished} onChange={set('furnished')}>
                  <option value="">All</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="lease_type">Lease Type:</label>
                <select id="lease_type" value={filters.lease_type} onChange={set('lease_type')}>
                  <option value="">All</option>
                  <option value="sell">Sell</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="sort_by">Sort By:</label>
                <select id="sort_by" value={filters.sort_by}
                  onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value, sort_order: e.target.value ? 'asc' : '' }))}>
                  <option value="">Default</option>
                  <option value="price">Price</option>
                  <option value="area">Area</option>
                  <option value="date">Date Posted</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="sort_order">Order:</label>
                <select id="sort_order" value={filters.sort_order} onChange={set('sort_order')}>
                  {orderOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </form>
        </div>

        <PropertyGrid properties={properties} />

        {user?.role === 0 && (
          <Link to="/list" className="add-property-btn">
            <span className="plus-icon">+</span>
          </Link>
        )}

        <footer>
          <p>&copy; 2025 PropertyFinder | All Rights Reserved</p>
          <div className="contact-us" style={{ marginTop: 10 }}>
            <p>
              Contact Us:{' '}
              <a href="mailto:contact@propertyfinder.com" style={{ color: 'white', textDecoration: 'underline' }}>
                propertyfinder428@gmail.com
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

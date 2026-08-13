import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import '../styles/home.css';

export default function Favorites() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/favorites')
      .then(({ data }) => setProperties(data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-home">
      <a className="pf-skip-link" href="#main">
        Skip to favourites
      </a>
      <Navbar showLogout={false} />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container home__body">
          <header className="pf-page-head home__section-head">
            <div>
              <h1 className="pf-page-head__title">Your favourites</h1>
              <p className="pf-page-head__sub">
                {loading
                  ? 'Loading…'
                  : `${properties.length} saved ${properties.length === 1 ? 'property' : 'properties'}.`}
              </p>
            </div>
          </header>

          <PropertyGrid
            properties={properties}
            loading={loading}
            empty={
              <EmptyState
                icon="heart"
                title="Nothing saved yet"
                action={
                  <Button as={Link} to="/home" variant="primary" icon="search">
                    Browse properties
                  </Button>
                }
              >
                Tap “Save to favourites” on any listing and it will appear here.
              </EmptyState>
            }
          />
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}

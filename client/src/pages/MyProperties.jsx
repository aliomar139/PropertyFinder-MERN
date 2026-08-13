import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import '../styles/home.css';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/properties/mine')
      .then(({ data }) => setProperties(data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-home">
      <a className="pf-skip-link" href="#main">
        Skip to listings
      </a>
      <Navbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container home__body">
          <header className="pf-page-head">
            <div>
              <h1 className="pf-page-head__title">My listings</h1>
              <p className="pf-page-head__sub">
                {loading
                  ? 'Loading…'
                  : `${properties.length} published ${properties.length === 1 ? 'property' : 'properties'}. Open one to edit or remove it.`}
              </p>
            </div>
            <Button as={Link} to="/list" variant="primary" icon="plus" className="home__list-cta">
              List a property
            </Button>
          </header>

          <PropertyGrid
            properties={properties}
            loading={loading}
            empty={
              <EmptyState
                icon="building"
                title="You have not listed anything yet"
                action={
                  <Button as={Link} to="/list" variant="primary" icon="plus">
                    List your first property
                  </Button>
                }
              >
                It takes a few minutes — location, a handful of details, and up to six photos.
              </EmptyState>
            }
          />
        </div>

        <SiteFooter />
      </main>

      <Link to="/list" className="home__fab" aria-label="List a property">
        <Icon name="plus" size={24} strokeWidth={2.2} />
      </Link>
    </div>
  );
}

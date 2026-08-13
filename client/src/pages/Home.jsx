import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import PropertyFilters, { EMPTY_FILTERS, ResultsBar } from '../components/PropertyFilters.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Alert, EmptyState, Toast } from '../components/ui/Feedback.jsx';
import useFavorites from '../hooks/useFavorites.js';
import SiteFooter from '../components/SiteFooter.jsx';
import '../styles/home.css';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(location.state?.message || '');

  // Saving is a buyer's action. Owners and admins browsing the same grid do not
  // get the control, which matches the rule the detail page already applies.
  const canSave = user?.role === 0;
  const favorites = useFavorites(canSave);

  // Consume the one-shot message so it does not reappear on back-navigation.
  useEffect(() => {
    if (location.state?.message) navigate('.', { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== ''));
    api
      .get('/properties', { params })
      .then(({ data }) => {
        if (!cancelled) setProperties(data.properties);
      })
      .catch(() => {
        if (!cancelled) setError('We could not load listings just now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied]);

  const hasFilters = Object.entries(applied).some(
    ([k, v]) => v !== '' && k !== 'sort_order' && k !== 'sort_by'
  );

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
              <h1 className="pf-page-head__title">Browse properties</h1>
              <p className="pf-page-head__sub">
                Houses, apartments, villas and cabins across Lebanon.
              </p>
            </div>
            {user?.role === 0 && (
              <Button as={Link} to="/list" variant="primary" icon="plus" className="home__list-cta">
                List a property
              </Button>
            )}
          </header>

          <PropertyFilters applied={applied} onApply={setApplied} />

          {!error && (
            <ResultsBar
              applied={applied}
              onApply={setApplied}
              count={properties.length}
              loading={loading}
            />
          )}

          {error ? (
            <Alert tone="error" className="home__error">
              {error}{' '}
              <button
                type="button"
                className="home__retry"
                onClick={() => setApplied((f) => ({ ...f }))}
              >
                Try again
              </button>
            </Alert>
          ) : (
            <PropertyGrid
              properties={properties}
              loading={loading}
              savedIds={canSave ? favorites.savedIds : undefined}
              onToggleSave={canSave ? favorites.toggle : undefined}
              empty={
                hasFilters ? (
                  <EmptyState
                    icon="search"
                    title="No properties match those filters"
                    action={
                      <Button variant="secondary" onClick={() => setApplied(EMPTY_FILTERS)}>
                        Clear filters
                      </Button>
                    }
                  >
                    Try widening the price range, or removing the city filter to see the whole
                    governorate.
                  </EmptyState>
                ) : (
                  <EmptyState icon="building" title="No listings yet">
                    Nothing has been posted so far. Check back shortly.
                  </EmptyState>
                )
              }
            />
          )}
        </div>

        <SiteFooter />
      </main>

      {/* Floating compose action for mobile, where the header button scrolls
          away. Hidden on wide screens, where the header CTA is always in view. */}
      {user?.role === 0 && (
        <Link to="/list" className="home__fab" aria-label="List a property">
          <Icon name="plus" size={24} strokeWidth={2.2} />
        </Link>
      )}

      <Toast message={toast} tone="success" onDismiss={() => setToast('')} />
      <Toast message={favorites.notice} tone="success" onDismiss={favorites.clearNotice} />
    </div>
  );
}

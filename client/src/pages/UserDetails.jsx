import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg, imageUrl } from '../api/client';
import Navbar from '../components/Navbar.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { EmptyState, Skeleton } from '../components/ui/Feedback.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import '../styles/user_details.css';

/* Public owner profile. Contact details are the reason anyone opens this page,
   so they are actionable links rather than plain text. */
export default function UserDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/users/${id}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(errMsg(err, 'We could not find that person.'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="page-user-details">
      <Navbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container ud">
          {error ? (
            <EmptyState
              icon="alertCircle"
              title="Profile unavailable"
              action={
                <Button as={Link} to="/home" variant="primary" icon="arrowLeft">
                  Back to browse
                </Button>
              }
            >
              {error}
            </EmptyState>
          ) : !data ? (
            <div aria-busy="true">
              <span className="pf-sr-only">Loading profile…</span>
              <Skeleton height="9rem" radius="var(--r-lg)" />
            </div>
          ) : (
            <>
              <Link to="/home" className="ud__back">
                <Icon name="arrowLeft" size={16} />
                Back to browse
              </Link>

              <header className="ud__card pf-card">
                <img
                  className="ud__avatar"
                  src={imageUrl(data.user.profile)}
                  alt=""
                  width="88"
                  height="88"
                />

                <div className="ud__identity">
                  <h1 className="ud__name">
                    {data.user.firstname} {data.user.lastname}
                    {data.user.verify === 1 && (
                      <span className="pf-badge pf-badge--success ud__verified">
                        <Icon name="badgeCheck" size={14} />
                        Verified
                      </span>
                    )}
                  </h1>
                  <p className="pf-caption">
                    {data.propertyCount} {data.propertyCount === 1 ? 'listing' : 'listings'} on
                    PropertyFinder
                  </p>
                </div>

                <dl className="ud__contact">
                  <div>
                    <dt>
                      <Icon name="mail" size={15} />
                      Email
                    </dt>
                    <dd>
                      <a href={`mailto:${data.user.email}`}>{data.user.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Icon name="phone" size={15} />
                      Phone
                    </dt>
                    <dd>
                      <a href={`tel:+961${data.user.number}`} className="pf-num">
                        +961 {data.user.number}
                      </a>
                    </dd>
                  </div>
                </dl>
              </header>

              <section className="ud__listings">
                <h2 className="pf-page-head__title">Listings</h2>
                <PropertyGrid
                  properties={data.properties}
                  empty={
                    <EmptyState icon="building" title="No listings yet">
                      This person has not published anything at the moment.
                    </EmptyState>
                  }
                />
              </section>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

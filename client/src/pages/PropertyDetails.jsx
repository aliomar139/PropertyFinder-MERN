import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import PropertyGallery from '../components/PropertyGallery.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { TextAreaField } from '../components/ui/Field.jsx';
import { Alert, EmptyState, Skeleton, Toast } from '../components/ui/Feedback.jsx';
import { ConfirmDialog } from '../components/ui/Modal.jsx';
import '../styles/property_details.css';

const MONEY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const [reportState, setReportState] = useState(null); // { tone, message }
  const [reportBusy, setReportBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/properties/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setProperty(data.property);
        setIsFavorite(data.isFavorite);
      })
      .catch((err) => {
        if (!cancelled) setError(errMsg(err, 'We could not find that property.'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleFavorite() {
    // Respond immediately and reconcile afterwards: a favourite toggle that
    // waits on a round trip feels broken on a slow connection.
    const next = !isFavorite;
    setIsFavorite(next);
    setFavBusy(true);
    try {
      const { data } = await api.post(`/favorites/${id}/toggle`);
      setIsFavorite(data.isFavorite);
      setToast(data.isFavorite ? 'Saved to your favourites.' : 'Removed from your favourites.');
    } catch {
      setIsFavorite(!next);
      setToast('That did not save. Check your connection and try again.');
    } finally {
      setFavBusy(false);
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    setReportBusy(true);
    try {
      const { data } = await api.post('/reports', { propertyId: id, reason });
      setReportState({ tone: 'success', message: data.message });
      setShowReason(false);
      setReason('');
    } catch (err) {
      setReportState({ tone: 'error', message: errMsg(err) });
    } finally {
      setReportBusy(false);
    }
  }

  async function deleteProperty() {
    setDeleting(true);
    try {
      await api.delete(`/properties/${id}`);
      navigate('/home', { state: { message: 'Listing deleted.' } });
    } catch (err) {
      setConfirmDelete(false);
      setError(errMsg(err));
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <div className="page-property-details">
        <Navbar />
        <main className="pf-below-appbar">
          <div className="pf-container pd__shell">
            <EmptyState
              icon="alertCircle"
              title="This listing is not available"
              action={
                <Button as={Link} to="/home" variant="primary" icon="arrowLeft">
                  Back to browse
                </Button>
              }
            >
              {error}
            </EmptyState>
          </div>
        </main>
      </div>
    );
  }

  // Loading skeleton mirrors the final layout, so nothing shifts on arrival.
  if (!property) {
    return (
      <div className="page-property-details">
        <Navbar />
        <main className="pf-below-appbar" aria-busy="true">
          <div className="pf-container pd__shell">
            <span className="pf-sr-only">Loading property…</span>
            <div className="pd__layout">
              <Skeleton height="clamp(240px, 42vw, 460px)" radius="var(--r-lg)" />
              <div className="pf-stack">
                <Skeleton width="45%" height="2rem" />
                <Skeleton width="70%" height="1.1rem" />
                <Skeleton height="6rem" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const ownerId = property.owner?._id || property.owner;
  const isOwner = String(ownerId) === String(user.id);
  const isAdmin = user.role === 1;
  const isRent = property.status === 'rent';
  const d = property.details || {};
  const canReport = user.role === 0 && !isOwner;

  const facts = [
    { icon: 'ruler', label: 'Area', value: `${d.area} m²` },
    { icon: 'bed', label: 'Bedrooms', value: d.nbBedrooms },
    { icon: 'bath', label: 'Bathrooms', value: d.nbBathrooms },
    { icon: 'sofa', label: 'Living rooms', value: d.nbLivingrooms },
    { icon: 'home', label: 'Type', value: property.type },
    { icon: 'check', label: 'Furnished', value: d.furnished ? 'Yes' : 'No' },
  ].filter((f) => f.value != null && f.value !== '');

  return (
    <div className="page-property-details">
      <Navbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container pd__shell">
          <Link to="/home" className="pd__back">
            <Icon name="arrowLeft" size={16} />
            Back to browse
          </Link>

          <div className="pd__layout">
            <PropertyGallery photos={property.images || []} title={property.title} />

            <div className="pd__aside">
              <div className="pd__headline">
                <span className={`pf-badge ${isRent ? 'pf-badge--brand' : 'pf-badge--ink'}`}>
                  {isRent ? 'For rent' : 'For sale'}
                </span>
                <p className="pd__price pf-price">
                  {MONEY.format(d.price ?? property.price)}
                  {isRent && <span className="pd__per"> / month</span>}
                </p>
                <h1 className="pd__title">{property.title}</h1>
                <p className="pd__location">
                  <Icon name="mapPin" size={16} />
                  <span>{property.location}</span>
                </p>
              </div>

              {/* Save sits at the top of the action column because it is the thing
                a browsing visitor most often wants. Its label states the state
                in words, not by colour of a star alone. */}
              {user.role === 0 && !isOwner && (
                <button
                  type="button"
                  className="pd__fav"
                  onClick={toggleFavorite}
                  disabled={favBusy}
                  aria-pressed={isFavorite}
                >
                  <Icon
                    name="heart"
                    size={19}
                    strokeWidth={2}
                    className={isFavorite ? 'pd__fav-icon is-on' : 'pd__fav-icon'}
                  />
                  {isFavorite ? 'Saved to favourites' : 'Save to favourites'}
                </button>
              )}

              <dl className="pd__facts">
                {facts.map((f) => (
                  <div className="pd__fact" key={f.label}>
                    <dt>
                      <Icon name={f.icon} size={15} />
                      {f.label}
                    </dt>
                    <dd className="pf-num">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="pd__owner">
                <span className="pd__owner-avatar" aria-hidden="true">
                  <Icon name="user" size={18} />
                </span>
                <div>
                  <p className="pf-caption">Listed by</p>
                  <Link to={`/users/${ownerId}`} className="pd__owner-link">
                    {property.owner?.firstname
                      ? `${property.owner.firstname} ${property.owner.lastname}`
                      : 'View owner profile'}
                    {property.owner?.verify === 1 && (
                      <span className="pd__verified" title="Verified owner">
                        <Icon name="badgeCheck" size={15} />
                        <span className="pf-sr-only">Verified owner</span>
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Owner and admin controls. Delete is set apart from everything
                else and carries the danger colour. */}
              {(isOwner || isAdmin) && (
                <div className="pd__manage">
                  <p className="pf-caption">{isOwner ? 'Your listing' : 'Admin controls'}</p>
                  <div className="pf-actions">
                    {isOwner && (
                      <Button
                        variant="primary"
                        icon="pencil"
                        onClick={() => navigate(`/property/${id}/edit`)}
                      >
                        Edit listing
                      </Button>
                    )}
                    <Button
                      variant="danger-quiet"
                      icon="trash"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section className="pd__section">
            <h2>About this property</h2>
            <p className="pd__description pf-measure">{property.description}</p>
            {d.moreDetails && (
              <p className="pd__description pf-measure pf-muted">{d.moreDetails}</p>
            )}
          </section>

          {canReport && (
            <section className="pd__section pd__report">
              <h2>Something wrong with this listing?</h2>
              {reportState && <Alert tone={reportState.tone}>{reportState.message}</Alert>}

              {!showReason ? (
                <Button
                  variant="secondary"
                  icon="flag"
                  onClick={() => setShowReason(true)}
                  disabled={reportState?.tone === 'success'}
                >
                  {reportState?.tone === 'success' ? 'Report submitted' : 'Report this listing'}
                </Button>
              ) : (
                <form className="pd__report-form" onSubmit={submitReport}>
                  <TextAreaField
                    label="What is the problem?"
                    id="report-reason"
                    required
                    hint="Tell us what is misleading or inappropriate. An admin will review it."
                    placeholder="For example: the photos do not match the address."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="pf-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={reportBusy}
                      loadingLabel="Sending…"
                      disabled={reason.trim().length < 4}
                    >
                      Submit report
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowReason(false);
                        setReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteProperty}
        busy={deleting}
        title="Delete this listing?"
        description={`"${property.title}" and all of its photos will be removed permanently.`}
        confirmLabel="Delete listing"
        cancelLabel="Keep it"
      />

      <Toast message={toast} tone="success" onDismiss={() => setToast('')} />
    </div>
  );
}

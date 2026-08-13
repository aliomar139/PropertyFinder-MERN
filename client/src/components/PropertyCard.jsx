import { Link } from 'react-router-dom';
import { imageUrl } from '../api/client';
import Icon from './ui/Icon.jsx';

const MONEY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

/* One listing. The whole card is a single link — one target, no nested
   interactive elements competing for the same tap — and the information order
   matches how people actually scan a listing: photo, price, what it is, where. */
export default function PropertyCard({ property: p, saved, onToggleSave }) {
  const photo = p.images?.[0]?.path;
  const isRent = p.status === 'rent';
  const beds = p.details?.nbBedrooms;
  const baths = p.details?.nbBathrooms;

  return (
    <article className="pcard">
      {/* The save control is a sibling of the link, not a child of it: nesting a
          button inside an anchor is invalid, and it would put two competing
          targets under one tap. It is positioned over the photo instead, and
          reachable from the keyboard in its own right. */}
      {onToggleSave && (
        <button
          type="button"
          className="pcard__save"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${p.title} from favourites` : `Save ${p.title} to favourites`}
          onClick={() => onToggleSave(p.id)}
        >
          <Icon
            name="heart"
            size={18}
            strokeWidth={2}
            className={saved ? 'pcard__save-icon is-on' : 'pcard__save-icon'}
          />
        </button>
      )}

      <Link to={`/property/${p.id}`} className="pcard__link">
        <div className="pcard__media">
          {photo ? (
            <img
              src={imageUrl(photo)}
              /* The title is the generated "120 (m²) apartment" string, which
                 already describes the subject better than "Property" did. */
              alt={p.title}
              loading="lazy"
              decoding="async"
              width="400"
              height="300"
            />
          ) : (
            <div className="pcard__noimg">
              <Icon name="image" size={26} />
              <span className="pf-caption">No photo yet</span>
            </div>
          )}
          <span className={`pf-badge pcard__status ${isRent ? 'pcard__status--rent' : ''}`}>
            {isRent ? 'For rent' : 'For sale'}
          </span>
        </div>

        <div className="pcard__body">
          <p className="pcard__price pf-price">
            {MONEY.format(p.price)}
            {isRent && <span className="pcard__per"> / month</span>}
          </p>
          <h3 className="pcard__title">{p.title}</h3>
          <p className="pcard__location">
            <Icon name="mapPin" size={14} />
            <span>{p.location}</span>
          </p>

          <ul className="pcard__facts">
            {p.area != null && (
              <li>
                <Icon name="ruler" size={15} />
                <span className="pf-num">{p.area}</span> m²
              </li>
            )}
            {beds != null && (
              <li>
                <Icon name="bed" size={15} />
                <span className="pf-num">{beds}</span>
                <span className="pf-sr-only"> bedrooms</span>
                <span aria-hidden="true"> bed</span>
              </li>
            )}
            {baths != null && (
              <li>
                <Icon name="bath" size={15} />
                <span className="pf-num">{baths}</span>
                <span className="pf-sr-only"> bathrooms</span>
                <span aria-hidden="true"> bath</span>
              </li>
            )}
          </ul>
        </div>
      </Link>
    </article>
  );
}

/* Placeholder with the card's exact proportions, so the grid does not reflow
   when the real listings arrive. */
export function PropertyCardSkeleton() {
  return (
    <article className="pcard pcard--skeleton" aria-hidden="true">
      <div className="pcard__media">
        <span className="pf-skeleton" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
      <div className="pcard__body">
        <span className="pf-skeleton" style={{ width: '38%', height: '1.25rem' }} />
        <span className="pf-skeleton" style={{ width: '72%', height: '1rem' }} />
        <span className="pf-skeleton" style={{ width: '56%', height: '0.85rem' }} />
        <span className="pf-skeleton" style={{ width: '80%', height: '0.85rem' }} />
      </div>
    </article>
  );
}

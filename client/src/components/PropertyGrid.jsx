import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../api/client';

// The card grid + "See More" (8 at a time) behavior from home.php.
export default function PropertyGrid({ properties, emptyText = 'No properties found.' }) {
  const [visible, setVisible] = useState(8);

  if (!properties.length) return <p>{emptyText}</p>;

  return (
    <>
      <div className="scroll-container" id="scroll-container">
        {/* Inline display:block mirrors the PHP "See More" JS: the legacy CSS
            hides .scroll-item beyond :nth-child(-n+8), and only an inline
            style overrides it. Without this, items 9+ render but stay hidden. */}
        {properties.slice(0, visible).map((p) => (
          <div className="scroll-item" style={{ display: 'block' }} key={p.id}>
            <Link to={`/property/${p.id}`} className="property-link">
              <img
                src={imageUrl(p.images?.[0]?.path)}
                alt="Property"
                style={{ width: '100%', borderRadius: 8 }}
              />
              <div className="details">
                <h3>{p.title}</h3>
                <p>Location: {p.location}</p>
                <p>Price: ${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {visible < properties.length && (
        <button id="see-more" onClick={() => setVisible((v) => v + 8)}>See More</button>
      )}
    </>
  );
}

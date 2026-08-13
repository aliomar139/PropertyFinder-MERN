import { useEffect, useRef, useState } from 'react';
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard.jsx';
import Button from './ui/Button.jsx';
import { EmptyState } from './ui/Feedback.jsx';

const PAGE = 8;

/* The listing grid. Paging is done in state rather than by hiding overflow rows
   in CSS, so the DOM only ever holds what is actually on screen — and newly
   revealed cards get focus moved to the first of them, so "Show more" does not
   silently strand a keyboard user at the bottom of the page. */
export default function PropertyGrid({
  properties,
  loading = false,
  empty,
  emptyText = 'Nothing matches those filters yet.',
  savedIds,
  onToggleSave
}) {
  const [visible, setVisible] = useState(PAGE);
  const firstNewRef = useRef(null);
  const pendingFocus = useRef(false);

  // Reset paging whenever the underlying result set changes.
  useEffect(() => {
    setVisible(PAGE);
  }, [properties]);

  useEffect(() => {
    if (pendingFocus.current && firstNewRef.current) {
      firstNewRef.current.querySelector('a')?.focus({ preventScroll: true });
      pendingFocus.current = false;
    }
  }, [visible]);

  if (loading) {
    return (
      <div className="pgrid" aria-busy="true">
        <span className="pf-sr-only">Loading listings…</span>
        {Array.from({ length: 8 }, (_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return empty ?? <EmptyState icon="search" title="No listings to show">{emptyText}</EmptyState>;
  }

  const shown = properties.slice(0, visible);
  const remaining = properties.length - visible;

  return (
    <>
      <div className="pgrid">
        {shown.map((p, i) => (
          <div key={p.id} ref={i === visible - PAGE ? firstNewRef : undefined}>
            <PropertyCard
              property={p}
              saved={savedIds ? savedIds.has(String(p.id)) : undefined}
              onToggleSave={onToggleSave}
            />
          </div>
        ))}
      </div>

      {/* Count is stated, so "Show more" is never a leap into the unknown. */}
      <div className="pgrid__more">
        <p className="pf-caption" aria-live="polite">
          Showing {shown.length} of {properties.length}
        </p>
        {remaining > 0 && (
          <Button
            variant="secondary"
            iconEnd="chevronDown"
            onClick={() => {
              pendingFocus.current = true;
              setVisible((v) => v + PAGE);
            }}
          >
            Show {Math.min(remaining, PAGE)} more
          </Button>
        )}
      </div>
    </>
  );
}

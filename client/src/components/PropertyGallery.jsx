import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { imageUrl } from '../api/client';
import Icon from './ui/Icon.jsx';
import { IconButton } from './ui/Button.jsx';
import { SPRINGS, createVelocityTracker, project, rubberband, spring } from '../lib/motion.js';

/* The photo gallery — the one place in this app where a gesture genuinely earns
   its keep, because swiping through photographs is how people actually look at
   a property on a phone.

   What makes it feel physical rather than scripted:
   • the track follows the finger 1:1 from the exact point it was grabbed;
   • dragging past the first or last photo meets progressive resistance instead
     of a dead stop;
   • on release the landing slide is chosen from where the flick was *going*
     (momentum projection), not from where the finger happened to lift;
   • the settling animation starts at the finger's release velocity, so there is
     no seam between dragging and animating;
   • a moving track can be grabbed and reversed at any instant — the spring
     re-targets from the live position and current velocity rather than
     restarting from the logical value.

   Every one of those behaviours is also reachable without a pointer: arrow
   keys, the two step buttons, and the thumbnail strip all drive the same state. */
export default function PropertyGallery({ photos, title }) {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const anim = useRef(null);
  const drag = useRef(null);
  const tracker = useRef(createVelocityTracker());
  const count = photos.length;

  const width = () => viewportRef.current?.offsetWidth || 1;

  const setX = useCallback((x) => {
    trackRef.current?.style.setProperty('transform', `translate3d(${x}px, 0, 0)`);
  }, []);

  const currentX = () => {
    const m = /translate3d\((-?[\d.]+)px/.exec(trackRef.current?.style.transform || '');
    return m ? parseFloat(m[1]) : -index * width();
  };

  const goTo = useCallback(
    (next, velocity = 0) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      setIndex(clamped);
      anim.current?.stop();
      // Bounce only because a gesture carried momentum into this animation. A
      // keyboard step (velocity 0) settles without overshoot.
      const params = velocity ? SPRINGS.flick : SPRINGS.move;
      anim.current = spring({
        from: currentX(),
        to: -clamped * width(),
        velocity,
        ...params,
        restDelta: 0.4,
        onUpdate: setX
      });
    },
    [count, setX]
  );

  // Position without animating on first paint and on resize, so a rotation or a
  // window drag never leaves the track parked between two photos.
  useLayoutEffect(() => {
    setX(-index * width());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    const onResize = () => {
      anim.current?.stop();
      setX(-index * width());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [index, setX]);

  useEffect(() => () => anim.current?.stop(), []);

  function onPointerDown(e) {
    if (count < 2 || e.button !== 0) return;
    // Grabbing a moving track picks it up where it is — no jump back to the
    // logical position.
    anim.current?.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      offset: currentX(),
      decided: false,
      horizontal: false
    };
    tracker.current.reset(e.clientX, e.timeStamp);
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // A short hysteresis before committing to a direction: below ~10px the
    // intent is ambiguous, and stealing those pixels would break vertical
    // page scrolling on a touch screen.
    if (!d.decided) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      d.decided = true;
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!d.horizontal) {
        drag.current = null;
        return;
      }
      setDragging(true);
    }

    tracker.current.add(e.clientX, e.timeStamp);
    const raw = d.offset + dx;
    const min = -(count - 1) * width();
    // Past either end the track keeps responding, but gives less and less.
    if (raw > 0) setX(rubberband(raw, width()));
    else if (raw < min) setX(min - rubberband(min - raw, width()));
    else setX(raw);
  }

  function endDrag(e) {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!d || !d.horizontal) return;

    const velocity = tracker.current.velocity();
    // Where a scroll view would come to rest, then snap to the nearest slide to
    // that point — this is what turns a small flick into a decisive page turn.
    const projected = currentX() + project(velocity, 0.99);
    const target = Math.round(-projected / width());
    goTo(target, velocity);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  }

  if (!count) {
    return (
      <div className="gallery gallery--empty">
        <Icon name="image" size={30} />
        <p className="pf-caption">No photos have been added to this listing yet.</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div
        className="gallery__viewport"
        ref={viewportRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Photos of ${title}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-dragging={dragging || undefined}
      >
        <div className="gallery__track" ref={trackRef}>
          {photos.map((photo, i) => (
            <div className="gallery__slide" key={photo.id || i} aria-hidden={i !== index}>
              <img
                src={imageUrl(photo.path)}
                alt={`${title} — photo ${i + 1} of ${count}`}
                draggable="false"
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <IconButton
              solid
              className="gallery__nav gallery__nav--prev"
              label="Previous photo"
              icon="chevronLeft"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            />
            <IconButton
              solid
              className="gallery__nav gallery__nav--next"
              label="Next photo"
              icon="chevronRight"
              disabled={index === count - 1}
              onClick={() => goTo(index + 1)}
            />
            <p className="gallery__counter pf-num" aria-hidden="true">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {/* Position is announced rather than left to the visual counter alone. */}
      <p className="pf-sr-only" aria-live="polite">
        Photo {index + 1} of {count}
      </p>

      {count > 1 && (
        <div className="gallery__thumbs" role="tablist" aria-label="Choose a photo">
          {photos.map((photo, i) => (
            <button
              key={photo.id || i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              className="gallery__thumb"
              onClick={() => goTo(i)}
            >
              <img src={imageUrl(photo.path)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

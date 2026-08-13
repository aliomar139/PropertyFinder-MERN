import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SPRINGS, createVelocityTracker, project, rubberband, spring } from '../../lib/motion.js';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* A bottom sheet you can actually grab.

   While dragging, the sheet tracks the finger 1:1 from the point it was grabbed
   and rubber-bands when pulled upward past its open position. On release the
   decision to dismiss comes from the projected resting point — where the flick
   was *going* — not from where the finger happened to lift, and the closing
   animation starts at the finger's exact velocity so there is no seam between
   dragging and animating. The gesture can be reversed at any moment: the spring
   re-targets from the sheet's live position and current velocity. */
export default function Sheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);
  const scrimRef = useRef(null);
  const sheetRef = useRef(null);
  const restoreTo = useRef(null);
  const anim = useRef(null);
  const drag = useRef(null);
  const tracker = useRef(createVelocityTracker());

  const setY = useCallback((y) => {
    sheetRef.current?.style.setProperty('--sheet-y', `${y}px`);
  }, []);

  const height = () => sheetRef.current?.offsetHeight || 320;

  const animateTo = useCallback(
    (target, velocity, onDone) => {
      anim.current?.stop();
      const from = parseFloat(sheetRef.current?.style.getPropertyValue('--sheet-y') || '0');
      anim.current = spring({
        from,
        to: target,
        velocity,
        ...SPRINGS.sheet,
        onUpdate: setY,
        onRest: () => onDone?.()
      });
    },
    [setY]
  );

  // Open: mount below the fold, then spring up to rest.
  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    if (!mounted) return undefined;
    animateTo(height(), 0, () => setMounted(false));
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return undefined;
    setY(height());
    animateTo(0, 0);
    restoreTo.current = document.activeElement;
    const first = sheetRef.current?.querySelector(FOCUSABLE);
    (first || sheetRef.current)?.focus({ preventScroll: true });

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => () => anim.current?.stop(), []);

  function onPointerDown(e) {
    // Only the grabber area starts a drag, so links inside stay tappable.
    if (!e.currentTarget.dataset.grab) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    anim.current?.stop();
    const current = parseFloat(sheetRef.current?.style.getPropertyValue('--sheet-y') || '0');
    drag.current = { startY: e.clientY, offset: current };
    tracker.current.reset(e.clientY, e.timeStamp);
  }

  function onPointerMove(e) {
    if (!drag.current) return;
    tracker.current.add(e.clientY, e.timeStamp);
    const raw = drag.current.offset + (e.clientY - drag.current.startY);
    // Downward follows the finger exactly; upward resists past the open edge.
    setY(raw >= 0 ? raw : -rubberband(-raw, height()));
  }

  function endDrag(e) {
    if (!drag.current) return;
    drag.current = null;
    const velocity = tracker.current.velocity();
    const current = parseFloat(sheetRef.current?.style.getPropertyValue('--sheet-y') || '0');
    const projected = current + project(velocity);
    // Dismiss if the throw is heading past the halfway line.
    if (projected > height() * 0.45) {
      animateTo(height(), velocity, () => onClose?.());
    } else {
      animateTo(0, velocity);
    }
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = Array.from(sheetRef.current?.querySelectorAll(FOCUSABLE) || []);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      ref={scrimRef}
      className="pf-scrim"
      /* The scrim fades over roughly the time the sheet takes to spring away,
         so it never disappears out from under a sheet still on screen. */
      style={{
        alignItems: 'end',
        padding: 0,
        opacity: open ? 1 : 0,
        transition: 'opacity 260ms var(--ease-out)'
      }}
      onPointerDown={(e) => {
        if (e.target === scrimRef.current) onClose?.();
      }}
    >
      <div
        ref={sheetRef}
        className="pf-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {/* The grab handle is the drag surface and is decorative to AT — the
            dialog is fully operable with Escape and Tab without it. */}
        <div
          data-grab="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ padding: '4px 0 0', cursor: 'grab', touchAction: 'none' }}
        >
          <div className="pf-sheet__grabber" />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

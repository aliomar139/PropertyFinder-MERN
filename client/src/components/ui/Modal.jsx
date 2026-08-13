import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Button, { IconButton } from './Button.jsx';
import Icon from './Icon.jsx';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* An accessible modal task: dims and blurs the background, traps focus, closes
   on Escape or scrim click, and returns focus to whatever opened it. The exit
   plays the entrance in reverse so the surface leaves along the path it
   arrived on. */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  labelledBy,
  dismissible = true,
  origin
}) {
  const autoId = useId();
  const titleId = `${autoId}-title`;
  const descId = `${autoId}-desc`;
  const scrimRef = useRef(null);
  const panelRef = useRef(null);
  const restoreTo = useRef(null);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 140); // matches --dur-fast
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Remember the trigger and lock background scrolling for as long as the dialog
  // is up; hand focus back to the trigger when it goes away.
  useEffect(() => {
    if (!open) return undefined;
    restoreTo.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      if (restoreTo.current instanceof HTMLElement) {
        restoreTo.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Focus moves in a separate effect keyed on `mounted`, not on `open`: on the
  // render where `open` first flips true the panel has not been created yet, so
  // an effect keyed on `open` alone would run against a null ref and silently
  // leave focus behind on the page underneath.
  useEffect(() => {
    if (!mounted || !open) return;
    const first = panelRef.current?.querySelector(FOCUSABLE);
    (first || panelRef.current)?.focus({ preventScroll: true });
  }, [mounted, open]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;
      // Keep Tab inside the dialog — the page behind it is not reachable.
      const items = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) || []);
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
    },
    [dismissible, onClose]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      ref={scrimRef}
      className="pf-scrim"
      data-closing={closing || undefined}
      onPointerDown={(e) => {
        if (dismissible && e.target === scrimRef.current) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="pf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || (title ? titleId : undefined)}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={origin ? { '--modal-origin': origin } : undefined}
      >
        {dismissible && (
          <IconButton
            label="Close"
            icon="x"
            onClick={onClose}
            style={{ position: 'absolute', top: 8, right: 8, width: 36, height: 36 }}
          />
        )}
        {title && (
          <h2 className="pf-modal__title" id={titleId}>
            {title}
          </h2>
        )}
        {description && (
          <p className="pf-modal__body" id={descId}>
            {description}
          </p>
        )}
        {children}
        {actions && <div className="pf-modal__actions">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}

/* Confirmation is reserved for genuinely destructive, irreversible actions. The
   confirming button carries the danger colour and names the action explicitly,
   so "Yes / No" never leaves the user guessing what they are agreeing to. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  busy = false
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={busy}
            loadingLabel="Working…"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {destructive && (
        <p
          className="pf-caption"
          style={{ display: 'flex', gap: 8, marginTop: 12, color: 'var(--danger-hover)' }}
        >
          <Icon name="alertTriangle" size={14} />
          This cannot be undone.
        </p>
      )}
    </Modal>
  );
}

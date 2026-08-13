import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

const ICONS = {
  success: 'checkCircle',
  error: 'alertCircle',
  warning: 'alertTriangle',
  info: 'info'
};

/* Inline status/completion/warning/error banner. Colour is never the only
   signal — each tone has its own icon — and errors announce themselves. */
export function Alert({ tone = 'info', icon, children, className = '', ...rest }) {
  const isLoud = tone === 'error';
  return (
    <div
      className={`pf-alert pf-alert--${tone} ${className}`.trim()}
      role={isLoud ? 'alert' : 'status'}
      aria-live={isLoud ? 'assertive' : 'polite'}
      {...rest}
    >
      <Icon name={icon || ICONS[tone]} size={18} />
      <div>{children}</div>
    </div>
  );
}

/* Transient confirmation. Auto-dismisses, never steals focus, and is announced
   through a polite live region so it does not interrupt what the user is doing.
   The timer pauses on hover/focus so a slow reader is not cut off. */
export function Toast({ message, tone = 'success', duration = 4000, onDismiss }) {
  const paused = useRef(false);
  // Held in a ref so an inline arrow at the call site does not restart the
  // dismiss timer on every parent render.
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!message) return undefined;
    let timer;
    const tick = () => {
      timer = setTimeout(() => {
        if (paused.current) return tick();
        dismiss.current?.();
      }, duration);
    };
    tick();
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;

  return createPortal(
    <div className="pf-toast-region" role="status" aria-live="polite">
      <div
        className={`pf-toast pf-toast--${tone}`}
        onPointerEnter={() => {
          paused.current = true;
        }}
        onPointerLeave={() => {
          paused.current = false;
        }}
      >
        <Icon className="pf-toast__icon" name={ICONS[tone]} size={18} />
        <div className="pf-toast__body">{message}</div>
      </div>
    </div>,
    document.body
  );
}

/* Reserves the final box so content landing does not shift the layout. */
export function Skeleton({ width, height, radius, className = '', style }) {
  return (
    <span
      className={`pf-skeleton ${className}`.trim()}
      aria-hidden="true"
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
    />
  );
}

/* A blank region always says what is missing and offers the way forward. */
export function EmptyState({ icon = 'inbox', title, children, action }) {
  return (
    <div className="pf-empty">
      <span className="pf-empty__icon">
        <Icon name={icon} size={26} />
      </span>
      {title && <p className="pf-empty__title">{title}</p>}
      {children && <p className="pf-empty__body">{children}</p>}
      {action && <div className="pf-empty__action">{action}</div>}
    </div>
  );
}

/* Loading text for regions that are still fetching. Announced politely so
   screen-reader users learn that work is in progress. */
export function LoadingRegion({ label = 'Loading…', children }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="pf-sr-only">{label}</span>
      {children}
    </div>
  );
}

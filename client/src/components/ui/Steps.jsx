import Icon from './Icon.jsx';

/* Progress through a multi-step flow. The current position is stated in words
   for screen readers as well as drawn, and completed steps carry a tick rather
   than relying on colour alone. */
export default function Steps({ current, labels }) {
  return (
    <div className="pf-steps">
      <span className="pf-sr-only">
        Step {current} of {labels.length}: {labels[current - 1]}
      </span>
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'current' : 'todo';
        return (
          <span key={label} style={{ display: 'contents' }}>
            {i > 0 && <span className="pf-steps__bar" data-state={n <= current ? 'done' : undefined} aria-hidden="true" />}
            <span className="pf-steps__dot" data-state={state} aria-hidden="true">
              {state === 'done' ? <Icon name="check" size={12} strokeWidth={3} /> : n}
            </span>
            <span aria-hidden="true" style={{ color: state === 'current' ? 'var(--fg)' : undefined }}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

import { useId } from 'react';
import Icon from './Icon.jsx';

/* Every field carries a visible label — never a placeholder standing in for one
   — plus optional persistent helper text. The error lives directly beneath the
   control it belongs to, is wired to the input via aria-describedby, and is
   announced through role="alert". */
export default function Field({
  label,
  hint,
  error,
  required,
  id: providedId,
  children,
  className = ''
}) {
  const autoId = useId();
  const id = providedId || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`pf-field ${className}`.trim()}>
      <label className="pf-label" htmlFor={id}>
        {label}
        {required && (
          <span className="pf-label__req" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="pf-sr-only"> (required)</span>}
      </label>

      {children({
        id,
        required: !!required,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined
      })}

      {hint && (
        <span className="pf-hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="pf-error" id={errId} role="alert">
          <Icon name="alertCircle" size={14} />
          {error}
        </span>
      )}
    </div>
  );
}

/* Convenience wrappers so the common cases stay one line at the call site. */
export function TextField({ label, hint, error, required, className, inputRef, ...input }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={input.id} className={className}>
      {(a11y) => <input className="pf-input" ref={inputRef} {...a11y} {...input} />}
    </Field>
  );
}

export function SelectField({ label, hint, error, required, className, children, ...select }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={select.id} className={className}>
      {(a11y) => (
        <select className="pf-select" {...a11y} {...select}>
          {children}
        </select>
      )}
    </Field>
  );
}

export function TextAreaField({ label, hint, error, required, className, ...area }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={area.id} className={className}>
      {(a11y) => <textarea className="pf-textarea" {...a11y} {...area} />}
    </Field>
  );
}

/* Mutually exclusive choice rendered as a segmented control. Native radios sit
   underneath, so arrow-key navigation and screen-reader grouping come free. */
export function SegmentedField({ label, name, value, onChange, options, error, required }) {
  const autoId = useId();
  const errId = error ? `${autoId}-error` : undefined;

  return (
    <fieldset
      className="pf-field"
      style={{ border: 0, margin: 0, padding: 0, minInlineSize: 0 }}
      aria-describedby={errId}
    >
      <legend className="pf-label" style={{ padding: 0 }}>
        {label}
        {required && (
          <span className="pf-label__req" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className="pf-segmented">
        {options.map((opt) => (
          <label className="pf-segmented__option" key={opt.value}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              required={required}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className="pf-error" id={errId} role="alert">
          <Icon name="alertCircle" size={14} />
          {error}
        </span>
      )}
    </fieldset>
  );
}

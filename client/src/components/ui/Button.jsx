import Icon from './Icon.jsx';

/* `contrast` is the on-photograph variant: a solid light plate with brand ink,
   used where a blue fill would disappear into a dark image. It is not a second
   brand colour — there isn't one. */
const VARIANTS = ['primary', 'secondary', 'ghost', 'contrast', 'danger', 'danger-quiet'];

/* One button, five emphases. Loading disables the control and swaps in a
   spinner while keeping the label, so the button never changes width mid-flight
   and the user is never left guessing whether the tap registered. */
export default function Button({
  as: Tag = 'button',
  variant = 'secondary',
  size,
  block,
  loading = false,
  loadingLabel,
  icon,
  iconEnd,
  disabled,
  className = '',
  children,
  type,
  ...rest
}) {
  const v = VARIANTS.includes(variant) ? variant : 'secondary';
  const classes = [
    'pf-btn',
    `pf-btn--${v}`,
    size === 'sm' && 'pf-btn--sm',
    size === 'lg' && 'pf-btn--lg',
    block && 'pf-btn--block',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const isButton = Tag === 'button';
  const inert = disabled || loading;

  return (
    <Tag
      className={classes}
      type={isButton ? type || 'button' : undefined}
      disabled={isButton ? inert : undefined}
      aria-disabled={!isButton && inert ? true : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="pf-spinner" /> : icon ? <Icon name={icon} size={18} /> : null}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
      {!loading && iconEnd ? <Icon name={iconEnd} size={18} /> : null}
    </Tag>
  );
}

/* Icon-only control. `label` is mandatory — it becomes the accessible name and
   the tooltip, so the button is never a bare glyph to a screen reader. */
export function IconButton({
  label,
  icon,
  size = 20,
  solid,
  className = '',
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={['pf-icon-btn', solid && 'pf-icon-btn--solid', className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children ?? <Icon name={icon} size={size} />}
    </button>
  );
}

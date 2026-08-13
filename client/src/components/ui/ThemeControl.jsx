import { useTheme } from '../../hooks/useTheme.js';
import { IconButton } from './Button.jsx';
import Icon from './Icon.jsx';

const ICON = { light: 'sun', dark: 'moon' };

/* Compact form, for the app bar. A single control that flips to the other
   theme — the label states the destination ("Switch to dark appearance"), so
   the button is never an unexplained glyph, and the icon shows the theme you
   would GET rather than the one you are in, which is the reading people
   actually expect from a switch.

   The three-way choice (including "follow system") lives in the menu sheet
   below, where there is room to show it honestly. */
export function ThemeToggle({ className = '' }) {
  const { resolved, setTheme } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';

  return (
    <IconButton
      className={className}
      label={`Switch to ${next} appearance`}
      icon={ICON[next]}
      size={18}
      onClick={() => setTheme(next)}
    />
  );
}

const OPTIONS = [
  { value: 'system', label: 'System', icon: 'monitor' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' }
];

/* Expanded form. A real radio group, so arrow keys move between the options
   and a screen reader announces "Light, 2 of 3, selected" rather than reading
   three unrelated buttons. */
export function ThemePicker({ label = 'Appearance' }) {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="pf-theme-picker">
      <legend className="pf-theme-picker__legend">{label}</legend>
      <div className="pf-segmented pf-segmented--block">
        {OPTIONS.map((opt) => (
          <label key={opt.value} className="pf-segmented__option">
            <input
              type="radio"
              name="pf-appearance"
              value={opt.value}
              checked={theme === opt.value}
              onChange={() => setTheme(opt.value)}
            />
            <span>
              <Icon name={opt.icon} size={16} />
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

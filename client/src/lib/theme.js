/* ============================================================================
   Theme: system / light / dark.

   The DOM is the single source of truth — `data-theme` on <html> — and it is
   written twice: once by a blocking inline script in index.html before first
   paint (so there is no flash of the wrong theme), and thereafter by this
   module. Both use the same storage key and the same attribute values, so the
   pre-paint pass and the React pass can never disagree.

   "system" is stored as the ABSENCE of the attribute rather than as
   data-theme="system", because the CSS already resolves the system preference
   through prefers-color-scheme. Encoding it as a third attribute value would
   mean writing a third copy of every token.
   ========================================================================= */

export const THEME_KEY = 'pf-theme';
export const THEMES = ['system', 'light', 'dark'];

/** The user's stored choice — not necessarily what is on screen. */
export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored) ? stored : 'system';
  } catch {
    // Private mode / disabled storage: fall back to following the system.
    return 'system';
  }
}

/** What is actually on screen right now, with "system" resolved. */
export function resolveTheme(choice) {
  if (choice === 'light' || choice === 'dark') return choice;
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/* The address bar / status bar colour is a static <meta> pair keyed on
   prefers-color-scheme, which cannot see an explicit override. Once the user
   picks a theme we collapse it to a single unconditional tag so the browser
   chrome matches the app instead of the OS. */
function syncMetaThemeColor(resolved) {
  // The app bar is what sits under the browser's own bar, so theme-color
  // matches the chrome material, not the page background: deep navy in light,
  // the navy-black canvas in dark.
  const color = resolved === 'dark' ? '#020713' : '#001a4a';
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((tag) => tag.remove());
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = color;
  document.head.appendChild(meta);
}

export function applyTheme(choice) {
  const root = document.documentElement;
  if (choice === 'light' || choice === 'dark') {
    root.setAttribute('data-theme', choice);
  } else {
    root.removeAttribute('data-theme');
  }
  syncMetaThemeColor(resolveTheme(choice));
}

export function storeTheme(choice) {
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* Nothing to do — the choice still applies for this session. */
  }
}

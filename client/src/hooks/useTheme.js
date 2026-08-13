import { useCallback, useSyncExternalStore } from 'react';
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  storeTheme,
} from '../lib/theme.js';

/* One module-level store rather than a context provider: the theme is read by
   two unrelated places (the bar's toggle and the menu sheet's segmented
   control) and neither owns the other, so threading a provider through the
   tree would buy nothing. useSyncExternalStore keeps both in step. */

let current = getStoredTheme();
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  // A user on "system" should follow the OS live, not only at page load.
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (current === 'system') {
      applyTheme('system');
      emit();
    }
  };
  mq.addEventListener('change', onSystemChange);
  return () => {
    listeners.delete(fn);
    mq.removeEventListener('change', onSystemChange);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => 'system';

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next) => {
    current = next;
    storeTheme(next);
    applyTheme(next);
    emit();
  }, []);

  return { theme: choice, resolved: resolveTheme(choice), setTheme };
}

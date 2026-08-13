import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

/* Saved-listing state for a grid of cards.

   The listing endpoint does not report per-property favourite status — only the
   detail endpoint does — so the set is fetched once from GET /favorites and
   held here. That is one extra request on mount, and it uses the endpoints that
   already exist rather than changing the API contract.

   Toggling is optimistic: the heart fills on pointer-up and the request
   reconciles afterwards. A save that waits on a round trip feels broken on a
   slow connection, and the failure path puts the state back and says so. */
export default function useFavorites(enabled = true) {
  const [ids, setIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    api
      .get('/favorites')
      .then(({ data }) => {
        if (!cancelled) setIds(new Set(data.properties.map((p) => String(p.id))));
      })
      // A failure here is not worth an error banner: the grid still works, the
      // hearts simply start empty and correct themselves on first toggle.
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const toggle = useCallback(async (id) => {
    const key = String(id);
    let wasSaved = false;
    setIds((prev) => {
      const next = new Set(prev);
      wasSaved = next.has(key);
      if (wasSaved) next.delete(key);
      else next.add(key);
      return next;
    });

    try {
      const { data } = await api.post(`/favorites/${key}/toggle`);
      setIds((prev) => {
        const next = new Set(prev);
        if (data.isFavorite) next.add(key);
        else next.delete(key);
        return next;
      });
      setNotice(data.isFavorite ? 'Saved to your favourites.' : 'Removed from your favourites.');
    } catch {
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(key);
        else next.delete(key);
        return next;
      });
      setNotice('That did not save. Check your connection and try again.');
    }
  }, []);

  return { savedIds: ids, ready, toggle, notice, clearNotice: () => setNotice('') };
}

import { useCallback, useEffect, useState } from 'react';

const WISHLIST_KEY = 'story_wishlist';
const RECENT_KEY = 'story_recently_viewed';
const MAX_RECENT = 6;

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

// ─── Wishlist (DB for logged-in, localStorage for guests) ───
export function useWishlist(isLoggedIn = false) {
  const [ids, setIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
  });
  const [synced, setSynced] = useState(false);

  // Sync from API when logged in
  useEffect(() => {
    if (!isLoggedIn || synced) return;
    fetch(`${API_BASE}/wishlist`, { credentials: 'include' })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.ids) {
          setIds(res.data.ids);
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(res.data.ids));
        }
        setSynced(true);
      })
      .catch(() => setSynced(true));
  }, [isLoggedIn, synced]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      return next;
    });

    // Sync to API if logged in
    if (isLoggedIn) {
      fetch(`${API_BASE}/wishlist/${productId}`, {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const isWishlisted = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { wishlistIds: ids, toggle, isWishlisted, count: ids.length };
}

// ─── Recently Viewed (always localStorage) ───
export function useRecentlyViewed() {
  const [items, setItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((productId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  return { recentIds: items, addRecent: add };
}

import { useState, useEffect, useMemo } from 'react';

/**
 * Generic debounced search over a list.
 * Returns matching items and loading state. Parent handles single/multiple/no-match behavior.
 */
export function useDebouncedSearch<T>(
  searchTerm: string,
  items: T[],
  getSearchableText: (item: T) => string,
  debounceMs: number
): { matchingItems: T[]; isSearching: boolean } {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setDebouncedTerm('');
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedTerm(trimmed);
      setIsSearching(false);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [searchTerm, debounceMs]);

  const matchingItems = useMemo(() => {
    if (!debouncedTerm) return [];
    const lower = debouncedTerm.toLowerCase();
    return items.filter((item) => {
      const text = getSearchableText(item);
      return text && text.toLowerCase().includes(lower);
    });
  }, [items, debouncedTerm, getSearchableText]);

  return { matchingItems, isSearching };
}

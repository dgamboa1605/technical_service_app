import { useState, useCallback } from 'react';

/**
 * Hook to run async work with shared loading and error state.
 * Use for try/catch/setLoading/setError patterns in hooks and pages.
 *
 * @returns run(fn) - executes fn(), sets loading/error, returns fn result
 * @returns isLoading, error, resetError
 */
export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => setError(null), []);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { run, isLoading, error, resetError };
}

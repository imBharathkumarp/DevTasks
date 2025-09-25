// Custom hook for debouncing values (useful for search inputs)
import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * Useful for search inputs to avoid excessive API calls or filtering
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
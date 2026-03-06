import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export const useSearchParamsState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback(
    (key: string, defaultValue = '') => searchParams.get(key) ?? defaultValue,
    [searchParams],
  );

  const getNumber = useCallback(
    (key: string, defaultValue: number) => {
      const val = searchParams.get(key);
      if (val === null) return defaultValue;
      const num = Number(val);
      return Number.isNaN(num) ? defaultValue : num;
    },
    [searchParams],
  );

  const set = useCallback(
    (updates: Record<string, string | number | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === '') {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { get, getNumber, set };
};

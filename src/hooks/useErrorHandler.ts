import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  field?: string;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError({ message: err.message });
    } else if (typeof err === 'string') {
      setError({ message: err });
    } else {
      setError({ message: 'An unexpected error occurred' });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const response = await apiClient.get<T>(url);
        setState({ data: response.data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    fetchData();
  }, [url]);

  return state;
}

export function usePost<T>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const post = async (url: string, data: unknown) => {
    try {
      setState({ data: null, loading: true, error: null });
      const response = await apiClient.post<T>(url, data);
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, loading: false, error: err });
      throw err;
    }
  };

  return { ...state, post };
}

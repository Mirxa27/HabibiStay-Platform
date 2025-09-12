import { useState, useCallback, useEffect, useRef } from 'react';
import { HabibiStayError, useApiErrorHandler } from '../utils/errorHandling';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: HabibiStayError | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: HabibiStayError) => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const { handleApiError } = useApiErrorHandler();
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: any[]) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction(...args);
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, data, loading: false }));
        onSuccess?.(data);
      }
      
      return data;
    } catch (error) {
      const apiError = error instanceof HabibiStayError ? error : new HabibiStayError(
        (error as Error).message || 'An unexpected error occurred'
      );

      if (mountedRef.current) {
        setState(prev => ({ ...prev, error: apiError, loading: false }));
        handleApiError(apiError);
        onError?.(apiError);
      }

      throw apiError;
    }
  }, [asyncFunction, onSuccess, onError, handleApiError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook for managing form submission states
export function useFormSubmit<T = any>(
  submitFunction: (data: any) => Promise<T>
) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<HabibiStayError | null>(null);
  const { handleApiError } = useApiErrorHandler();

  const submit = useCallback(async (data: any) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitFunction(data);
      setSubmitting(false);
      return result;
    } catch (error) {
      const apiError = error instanceof HabibiStayError ? error : new HabibiStayError(
        (error as Error).message || 'Submission failed'
      );

      setSubmitError(apiError);
      setSubmitting(false);
      handleApiError(apiError, 'form submission');
      throw apiError;
    }
  }, [submitFunction, handleApiError]);

  const reset = useCallback(() => {
    setSubmitError(null);
    setSubmitting(false);
  }, []);

  return {
    submit,
    submitting,
    submitError,
    reset
  };
}

// Hook for managing paginated data
interface UsePaginationOptions<T> {
  pageSize?: number;
  initialPage?: number;
  onDataLoad?: (data: T[], page: number) => void;
}

export function usePagination<T = any>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[], total: number, hasMore: boolean }>,
  options: UsePaginationOptions<T> = {}
) {
  const { pageSize = 20, initialPage = 1, onDataLoad } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HabibiStayError | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { handleApiError } = useApiErrorHandler();

  const loadPage = useCallback(async (pageNumber: number, append: boolean = false) => {
    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fetchFunction(pageNumber, pageSize);
      
      setData(prev => append ? [...prev, ...result.data] : result.data);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNumber);
      
      onDataLoad?.(result.data, pageNumber);
    } catch (error) {
      const apiError = error instanceof HabibiStayError ? error : new HabibiStayError(
        (error as Error).message || 'Failed to load data'
      );
      
      setError(apiError);
      handleApiError(apiError, 'pagination');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchFunction, pageSize, onDataLoad, handleApiError]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadPage(page + 1, true);
    }
  }, [hasMore, loading, page, loadPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(1, false);
  }, [loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setTotal(0);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  // Load initial data
  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  return {
    data,
    page,
    total,
    hasMore,
    loading,
    error,
    refreshing,
    loadMore,
    refresh,
    reset,
    reload: () => loadPage(page, false)
  };
}

// Hook for managing optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T[],
  updateFunction: (item: T) => Promise<T>,
  deleteFunction?: (id: string | number) => Promise<void>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string | number>>(new Set());
  const { handleApiError } = useApiErrorHandler();

  const updateItem = useCallback(async (item: T, optimisticUpdate?: Partial<T>) => {
    const itemId = (item as any).id;
    
    // Apply optimistic update
    if (optimisticUpdate) {
      setData(prev => prev.map(i => 
        (i as any).id === itemId ? { ...i, ...optimisticUpdate } : i
      ));
    }

    setPendingUpdates(prev => new Set(prev).add(itemId));

    try {
      const updatedItem = await updateFunction(item);
      
      // Apply real update
      setData(prev => prev.map(i => 
        (i as any).id === itemId ? updatedItem : i
      ));
    } catch (error) {
      // Revert optimistic update
      setData(prev => prev.map(i => 
        (i as any).id === itemId ? item : i
      ));
      
      handleApiError(error as HabibiStayError, 'optimistic update');
      throw error;
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [updateFunction, handleApiError]);

  const deleteItem = useCallback(async (itemId: string | number) => {
    if (!deleteFunction) return;

    const originalData = data;
    
    // Optimistically remove item
    setData(prev => prev.filter(i => (i as any).id !== itemId));
    setPendingUpdates(prev => new Set(prev).add(itemId));

    try {
      await deleteFunction(itemId);
    } catch (error) {
      // Revert deletion
      setData(originalData);
      handleApiError(error as HabibiStayError, 'optimistic delete');
      throw error;
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [deleteFunction, data, handleApiError]);

  const isUpdating = useCallback((itemId: string | number) => {
    return pendingUpdates.has(itemId);
  }, [pendingUpdates]);

  return {
    data,
    updateItem,
    deleteItem,
    isUpdating,
    setData
  };
}
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsync, useFormSubmit, usePagination, useOptimisticUpdate } from '../../hooks/useAsync';

// Mock the error handling utilities
vi.mock('../../utils/errorHandling', () => ({
  useApiErrorHandler: () => ({
    handleApiError: vi.fn()
  }),
  HabibiStayError: class HabibiStayError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'HabibiStayError';
    }
  }
}));

describe('useAsync', () => {
  it('should initialize with correct default state', () => {
    const asyncFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should execute async function and update state', async () => {
    const asyncFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toBe('test data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(asyncFunction).toHaveBeenCalledTimes(1);
  });

  it('should handle errors correctly', async () => {
    const error = new Error('Test error');
    const asyncFunction = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected error
      }
    });
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Test error');
  });

  it('should reset state correctly', async () => {
    const asyncFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toBe('test data');
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should execute immediately when immediate option is true', async () => {
    const asyncFunction = vi.fn().mockResolvedValue('test data');
    renderHook(() => useAsync(asyncFunction, { immediate: true }));
    
    // Wait for the immediate execution
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(asyncFunction).toHaveBeenCalledTimes(1);
  });
});

describe('useFormSubmit', () => {
  it('should initialize with correct default state', () => {
    const submitFunction = vi.fn();
    const { result } = renderHook(() => useFormSubmit(submitFunction));
    
    expect(result.current.submitting).toBe(false);
    expect(result.current.submitError).toBeNull();
  });

  it('should handle form submission correctly', async () => {
    const testData = { id: 1, name: 'Test' };
    const submitFunction = vi.fn().mockResolvedValue(testData);
    const { result } = renderHook(() => useFormSubmit(submitFunction));
    
    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit({ name: 'Test' });
    });
    
    expect(result.current.submitting).toBe(false);
    expect(result.current.submitError).toBeNull();
    expect(submitResult).toEqual(testData);
    expect(submitFunction).toHaveBeenCalledWith({ name: 'Test' });
  });

  it('should handle form submission errors', async () => {
    const error = new Error('Submission failed');
    const submitFunction = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useFormSubmit(submitFunction));
    
    await act(async () => {
      try {
        await result.current.submit({ name: 'Test' });
      } catch (e) {
        // Expected error
      }
    });
    
    expect(result.current.submitting).toBe(false);
    expect(result.current.submitError).toBeInstanceOf(Error);
    expect(result.current.submitError?.message).toBe('Submission failed');
  });

  it('should reset state correctly', async () => {
    const error = new Error('Submission failed');
    const submitFunction = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useFormSubmit(submitFunction));
    
    await act(async () => {
      try {
        await result.current.submit({ name: 'Test' });
      } catch (e) {
        // Expected error
      }
    });
    
    expect(result.current.submitError).toBeInstanceOf(Error);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.submitting).toBe(false);
    expect(result.current.submitError).toBeNull();
  });
});

describe('usePagination', () => {
  it('should initialize with correct default state', () => {
    const fetchFunction = vi.fn();
    const { result } = renderHook(() => usePagination(fetchFunction));
    
    expect(result.current.data).toEqual([]);
    expect(result.current.page).toBe(1);
    expect(result.current.total).toBe(0);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refreshing).toBe(false);
  });

  it('should load initial data', async () => {
    const mockData = { data: [{ id: 1, name: 'Item 1' }], total: 1, hasMore: false };
    const fetchFunction = vi.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => usePagination(fetchFunction));
    
    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(result.current.data).toEqual([{ id: 1, name: 'Item 1' }]);
    expect(result.current.total).toBe(1);
    expect(result.current.hasMore).toBe(false);
    expect(fetchFunction).toHaveBeenCalledWith(1, 20);
  });

  it('should handle loading more data', async () => {
    const mockData1 = { data: [{ id: 1, name: 'Item 1' }], total: 2, hasMore: true };
    const mockData2 = { data: [{ id: 2, name: 'Item 2' }], total: 2, hasMore: false };
    const fetchFunction = vi.fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);
    
    const { result } = renderHook(() => usePagination(fetchFunction));
    
    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Load more data
    await act(async () => {
      await result.current.loadMore();
    });
    
    expect(result.current.data).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]);
    expect(fetchFunction).toHaveBeenCalledTimes(2);
    expect(fetchFunction).toHaveBeenNthCalledWith(1, 1, 20);
    expect(fetchFunction).toHaveBeenNthCalledWith(2, 2, 20);
  });

  it('should handle refresh', async () => {
    const mockData = { data: [{ id: 1, name: 'Item 1' }], total: 1, hasMore: false };
    const fetchFunction = vi.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => usePagination(fetchFunction));
    
    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Refresh data
    await act(async () => {
      await result.current.refresh();
    });
    
    expect(result.current.refreshing).toBe(false);
    expect(fetchFunction).toHaveBeenCalledTimes(2);
  });

  it('should handle errors during data loading', async () => {
    const error = new Error('Failed to load data');
    const fetchFunction = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => usePagination(fetchFunction));
    
    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to load data');
  });
});

describe('useOptimisticUpdate', () => {
  it('should initialize with correct default state', () => {
    const initialData = [{ id: 1, name: 'Item 1' }];
    const updateFunction = vi.fn();
    const deleteFunction = vi.fn();
    const { result } = renderHook(() => useOptimisticUpdate(initialData, updateFunction, deleteFunction));
    
    expect(result.current.data).toEqual(initialData);
  });

  it('should handle item updates with optimistic update', async () => {
    const initialData = [{ id: 1, name: 'Item 1' }];
    const updatedItem = { id: 1, name: 'Updated Item 1' };
    const updateFunction = vi.fn().mockResolvedValue(updatedItem);
    const { result } = renderHook(() => useOptimisticUpdate(initialData, updateFunction));
    
    await act(async () => {
      await result.current.updateItem({ id: 1, name: 'Item 1' }, { name: 'Updated Item 1' });
    });
    
    expect(result.current.data).toEqual([updatedItem]);
    expect(updateFunction).toHaveBeenCalledWith({ id: 1, name: 'Item 1' });
  });

  it('should revert optimistic update on error', async () => {
    const initialData = [{ id: 1, name: 'Item 1' }];
    const updateFunction = vi.fn().mockRejectedValue(new Error('Update failed'));
    const { result } = renderHook(() => useOptimisticUpdate(initialData, updateFunction));
    
    await act(async () => {
      try {
        await result.current.updateItem({ id: 1, name: 'Item 1' }, { name: 'Updated Item 1' });
      } catch (e) {
        // Expected error
      }
    });
    
    // Should revert to original data
    expect(result.current.data).toEqual(initialData);
  });

  it('should handle item deletion with optimistic delete', async () => {
    const initialData = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    const deleteFunction = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useOptimisticUpdate(initialData, vi.fn(), deleteFunction));
    
    await act(async () => {
      await result.current.deleteItem(1);
    });
    
    expect(result.current.data).toEqual([{ id: 2, name: 'Item 2' }]);
    expect(deleteFunction).toHaveBeenCalledWith(1);
  });

  it('should revert optimistic delete on error', async () => {
    const initialData = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    const deleteFunction = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const { result } = renderHook(() => useOptimisticUpdate(initialData, vi.fn(), deleteFunction));
    
    await act(async () => {
      try {
        await result.current.deleteItem(1);
      } catch (e) {
        // Expected error
      }
    });
    
    // Should revert to original data
    expect(result.current.data).toEqual(initialData);
  });

  it('should track updating state', async () => {
    const initialData = [{ id: 1, name: 'Item 1' }];
    const updateFunction = vi.fn().mockResolvedValue({ id: 1, name: 'Updated Item 1' });
    const { result } = renderHook(() => useOptimisticUpdate(initialData, updateFunction));
    
    // Initially not updating
    expect(result.current.isUpdating(1)).toBe(false);
    
    // While updating
    let updatePromise;
    await act(async () => {
      updatePromise = result.current.updateItem({ id: 1, name: 'Item 1' });
      // Check immediately after starting update
      expect(result.current.isUpdating(1)).toBe(true);
    });
    
    // After update completes
    await updatePromise;
    expect(result.current.isUpdating(1)).toBe(false);
  });
});
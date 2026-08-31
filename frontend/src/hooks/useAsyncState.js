import { useState, useCallback, useRef } from 'react';

/**
 * useAsyncState Hook
 * 
 * A comprehensive hook for managing async operations with proper loading, error, and data states
 * Includes retry functionality, loading overlays, and proper cleanup
 * 
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} State object with data, loading, error, and control functions
 */
export const useAsyncState = (asyncFunction, options = {}) => {
  const {
    initialData = null,
    retryDelay = 1000,
    maxRetries = 3,
    onSuccess = null,
    onError = null,
    dependencies = []
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Execute the async function with error handling and retry logic
  const execute = useCallback(async (...args) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await asyncFunction(...args, {
        signal: abortControllerRef.current.signal
      });

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setData(result);
      setLastFetchTime(Date.now());
      setRetryCount(0);
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err.name === 'AbortError' || abortControllerRef.current.signal.aborted) {
        return;
      }

      console.error('Async operation failed:', err);
      setError(err);
      
      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  // Retry function with exponential backoff
  const retry = useCallback(async (...args) => {
    if (retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) reached`);
      return;
    }

    const delay = retryDelay * Math.pow(2, retryCount);
    setRetryCount(prev => prev + 1);

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    return new Promise((resolve) => {
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await execute(...args);
          resolve(result);
        } catch (err) {
          // If this retry also fails, the error is already handled in execute
          resolve(null);
        }
      }, delay);
    });
  }, [execute, retryCount, maxRetries, retryDelay]);

  // Reset all states
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    setData(initialData);
    setLoading(false);
    setError(null);
    setRetryCount(0);
    setLastFetchTime(null);
  }, [initialData]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  // Refresh function (re-execute with same parameters)
  const refresh = useCallback(async (...args) => {
    setRetryCount(0);
    return execute(...args);
  }, [execute]);

  return {
    // State
    data,
    loading,
    error,
    retryCount,
    lastFetchTime,
    
    // Actions
    execute,
    retry,
    reset,
    refresh,
    cleanup,
    
    // Computed states
    isEmpty: !loading && !error && (!data || (Array.isArray(data) && data.length === 0)),
    hasError: !!error,
    canRetry: retryCount < maxRetries,
    isRetrying: retryCount > 0 && loading
  };
};

/**
 * useMultipleAsyncState Hook
 * 
 * Manages multiple async operations simultaneously
 * Useful for pages that need to load multiple data sources
 */
export const useMultipleAsyncState = (operations = {}) => {
  const [states, setStates] = useState(() => {
    const initialStates = {};
    Object.keys(operations).forEach(key => {
      initialStates[key] = {
        data: null,
        loading: false,
        error: null
      };
    });
    return initialStates;
  });

  const executeOperation = useCallback(async (key, ...args) => {
    if (!operations[key]) {
      throw new Error(`Operation '${key}' not found`);
    }

    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true, error: null }
    }));

    try {
      const result = await operations[key](...args);
      setStates(prev => ({
        ...prev,
        [key]: { data: result, loading: false, error: null }
      }));
      return result;
    } catch (error) {
      setStates(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: false, error }
      }));
      throw error;
    }
  }, [operations]);

  const executeAll = useCallback(async (args = {}) => {
    const results = {};
    const promises = Object.keys(operations).map(async (key) => {
      try {
        results[key] = await executeOperation(key, ...(args[key] || []));
      } catch (error) {
        results[key] = { error };
      }
    });

    await Promise.allSettled(promises);
    return results;
  }, [executeOperation, operations]);

  const resetOperation = useCallback((key) => {
    setStates(prev => ({
      ...prev,
      [key]: { data: null, loading: false, error: null }
    }));
  }, []);

  const resetAll = useCallback(() => {
    const resetStates = {};
    Object.keys(operations).forEach(key => {
      resetStates[key] = { data: null, loading: false, error: null };
    });
    setStates(resetStates);
  }, [operations]);

  return {
    states,
    executeOperation,
    executeAll,
    resetOperation,
    resetAll,
    isAnyLoading: Object.values(states).some(state => state.loading),
    hasAnyError: Object.values(states).some(state => state.error),
    allLoaded: Object.values(states).every(state => !state.loading && !state.error)
  };
};

/**
 * usePagination Hook
 * 
 * Manages pagination state for lists with async data fetching
 */
export const usePagination = (fetchFunction, options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialData = [],
    cachePages = true
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cache, setCache] = useState(new Map());

  const asyncState = useAsyncState(fetchFunction, {
    initialData,
    onSuccess: (result) => {
      if (result && typeof result === 'object') {
        if (result.data && Array.isArray(result.data)) {
          setTotalItems(result.total || result.data.length);
          setTotalPages(result.totalPages || Math.ceil((result.total || result.data.length) / pageSize));
          
          if (cachePages) {
            setCache(prev => new Map(prev).set(`${currentPage}-${pageSize}`, result));
          }
        }
      }
    }
  });

  const goToPage = useCallback(async (page) => {
    const cacheKey = `${page}-${pageSize}`;
    
    if (cachePages && cache.has(cacheKey)) {
      const cachedResult = cache.get(cacheKey);
      asyncState.setData(cachedResult);
      setCurrentPage(page);
      return cachedResult;
    }

    setCurrentPage(page);
    return asyncState.execute({ page, pageSize, limit: pageSize, offset: (page - 1) * pageSize });
  }, [pageSize, cache, cachePages, asyncState]);

  const changePageSize = useCallback(async (newPageSize) => {
    setPageSize(newPageSize);
    setCache(new Map()); // Clear cache when page size changes
    return goToPage(1);
  }, [goToPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      return goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      return goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const refresh = useCallback(() => {
    setCache(new Map()); // Clear cache
    return goToPage(currentPage);
  }, [currentPage, goToPage]);

  return {
    ...asyncState,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    goToPage,
    changePageSize,
    nextPage,
    previousPage,
    refresh,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    pageInfo: {
      current: currentPage,
      size: pageSize,
      total: totalPages,
      totalItems,
      startItem: (currentPage - 1) * pageSize + 1,
      endItem: Math.min(currentPage * pageSize, totalItems)
    }
  };
};
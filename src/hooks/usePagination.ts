import { useState } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

export function usePagination(
  initialPage: number = 0,
  initialPageSize: number = 12
): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const reset = () => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset,
  };
}

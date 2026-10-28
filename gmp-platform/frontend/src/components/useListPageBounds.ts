import { useEffect } from 'react';

// One-based lists only. Placeholder, pending and failed responses cannot prove bounds.
export function useListPageBounds(page: number, totalPages: number | undefined, dataReady: boolean, onPageChange: (page: number) => void) {
  useEffect(() => {
    if (!dataReady || totalPages === undefined) return;
    const lastPage = Math.max(totalPages, 1);
    if (page > lastPage) onPageChange(lastPage);
  }, [page, totalPages, dataReady, onPageChange]);
}

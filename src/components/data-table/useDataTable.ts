import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { DataTableProps, DataTableState, DataTableColumn, Density } from './types';

export function useDataTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 10,
  onRowSelection,
  onPageChange,
  externalCurrentPage,
  externalTotalPages,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  onRowSelection?: (selectedItems: T[]) => void;
  onPageChange?: (page: number) => void;
  externalCurrentPage?: number;
  externalTotalPages?: number;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [density, setDensity] = useState<Density>('normal');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(col => !col.hidden).map(col => String(col.key)))
  );
  const [announcement, setAnnouncement] = useState('');
  const listRef = useRef(null);

  // Optimized filtering with specific field filtering
  // Optimized filtering with specific field filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    
    // Get searchable columns
    const searchableColumns = columns.filter(col => 
      !col.hidden && col.key
    );
    
    return data.filter(item => {
      return searchableColumns.some(col => {
        const value = item[col.key as keyof T];
        return String(value).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchTerm, columns]);

  // Sorting
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  // Sorting with stable sort and memoization
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    
    // Create a stable sort using index as tie-breaker
    const indexedData = filteredData.map((item, index) ={
      return { item: item, index: index };
    });
    
    const sorted = indexedData.sort((a, b) => {
      const aValue = (a.item as any)[sortConfig.key];
      const bValue = (b.item as any)[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return a.index - b.index; // stable sort
    }).map(obj => obj.item);
    
    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = externalTotalPages ?? Math.ceil(sortedData.length / pageSize);
  const currentPage = externalCurrentPage ?? internalCurrentPage;

  const paginatedData = useMemo(() => {
    if (externalCurrentPage !== undefined) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, externalCurrentPage]);

  const selectedItems = useMemo(() =>
    data.filter(item => selectedIds.has(item.id)),
    [data, selectedIds]
  );

  // Effects
  useEffect(() => {
    if (searchTerm) {
      setAnnouncement(`تم العثور على ${filteredData.length} نتيجة`);
    }
  }, [filteredData.length, searchTerm]);

  useEffect(() => {
    if (sortConfig.key) {
      const direction = sortConfig.direction === 'asc' ? 'تصاعدي' : 'تنازلي';
      const col = columns.find(c => String(c.key) === sortConfig.key);
      setAnnouncement(`تم الفرز حسب ${col?.title} ${direction}`);
    }
  }, [sortConfig, columns]);

  useEffect(() => {
    setAnnouncement(`الصفحة ${currentPage} من ${totalPages}`);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedIds(new Set());
    onRowSelection?.([]);
  }, [data, onRowSelection]);

  // Handlers
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handlePageClick = useCallback((page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  }, [onPageChange]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
      onRowSelection?.([]);
    } else {
      const newSelected = new Set(paginatedData.map(item => item.id));
      setSelectedIds(newSelected);
      onRowSelection?.(paginatedData);
    }
  }, [selectedIds, paginatedData, onRowSelection]);

  const toggleSelectRow = useCallback((id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    const newSelectedItems = data.filter(item => newSelected.has(item.id));
    onRowSelection?.(newSelectedItems);
  }, [selectedIds, data, onRowSelection]);

  const toggleColumnVisibility = useCallback((key: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(key)) {
      if (newVisible.size > 1) newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleColumns(newVisible);
  }, [visibleColumns]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    handlePageClick(1);
  }, [handlePageClick]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    onRowSelection?.([]);
  }, [onRowSelection]);

  const toggleDensity = useCallback(() => {
    setDensity(d => d === 'normal' ? 'compact' : 'normal');
  }, []);

  return {
    // State
    searchTerm,
    sortConfig,
    currentPage,
    internalCurrentPage,
    selectedIds,
    density,
    visibleColumns,
    announcement,
    listRef,
    
    // Derived data
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    selectedItems,
    
    // Handlers
    setSearchTerm,
    handleSort,
    handlePageClick,
    toggleSelectAll,
    toggleSelectRow,
    toggleColumnVisibility,
    handleSearchChange,
    clearSelection,
    toggleDensity,
    setInternalCurrentPage,
  };
}

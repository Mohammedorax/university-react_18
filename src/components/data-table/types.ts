import * as React from 'react';

export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
}

export interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  onRowSelection?: (selectedItems: T[]) => void;
  rowActions?: (item: T) => React.ReactNode;
  customRowActions?: (item: T) => React.ReactNode;
  caption?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  bulkActions?: (selectedItems: T[]) => React.ReactNode;
  virtualized?: boolean;
  virtualHeight?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  currentPage?: number;
  totalItems?: number;
}

export interface DataTableState<T> {
  searchTerm: string;
  sortConfig: { key: string; direction: 'asc' | 'desc' | null };
  internalCurrentPage: number;
  selectedIds: Set<string | number>;
  density: 'compact' | 'normal';
  visibleColumns: Set<string>;
  announcement: string;
}

export type Density = 'compact' | 'normal';

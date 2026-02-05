import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTableRowComponent } from './DataTableRow';
import type { DataTableColumn, Density } from './types';

interface DataTableBodyProps<T extends { id: string | number }> {
  data: T[];
  columns: DataTableColumn<T>[];
  visibleColumns: Set<string>;
  density: Density;
  sortConfig: { key: string; direction: 'asc' | 'desc' | null };
  selectedIds: Set<string | number>;
  isLoading?: boolean;
  emptyMessage?: string;
  showCheckboxes: boolean;
  rowActions?: (item: T) => React.ReactNode;
  customRowActions?: (item: T) => React.ReactNode;
  caption?: string;
  onSort: (key: string) => void;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string | number) => void;
}

export function DataTableBody<T extends { id: string | number }>({
  data,
  columns,
  visibleColumns,
  density,
  sortConfig,
  selectedIds,
  isLoading,
  emptyMessage = "لا توجد بيانات لعرضها",
  showCheckboxes,
  rowActions,
  customRowActions,
  caption,
  onSort,
  onToggleSelectAll,
  onToggleSelectRow,
}: DataTableBodyProps<T>) {
  const visibleCols = columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden);
  const colCount = visibleCols.length + (showCheckboxes ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden" role="region" aria-label="جدول البيانات">
      <div className="overflow-x-auto">
        <Table role="grid">
          {caption && <caption className="p-4 text-sm text-muted-foreground">{caption}</caption>}
          <TableHeader className="bg-muted/50" role="rowgroup">
            <TableRow role="row">
              {showCheckboxes && (
                <TableHead className="w-12" role="columnheader">
                  <input
                    type="checkbox"
                    className="rounded border-muted cursor-pointer"
                    checked={data.length > 0 && selectedIds.size === data.length}
                    onChange={onToggleSelectAll}
                    aria-label="تحديد جميع الصفوف"
                  />
                </TableHead>
              )}
              {visibleCols.map((col) => (
                <TableHead 
                  key={String(col.key)}
                  role="columnheader"
                  className={cn(
                    "text-right font-bold text-foreground focus-visible:bg-muted focus-visible:outline-none",
                    col.sortable && "cursor-pointer hover:bg-muted transition-colors"
                  )}
                  tabIndex={col.sortable ? 0 : -1}
                  onClick={() => col.sortable && onSort(String(col.key))}
                  onKeyDown={(e) => {
                    if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSort(String(col.key));
                    }
                  }}
                  aria-sort={sortConfig.key === String(col.key) ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div 
                    className="flex items-center gap-2"
                    role={col.sortable ? "button" : undefined}
                    aria-label={col.sortable ? `فرز حسب ${col.title}` : undefined}
                  >
                    {col.title}
                    {col.sortable && <ArrowUpDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />}
                  </div>
                </TableHead>
              ))}
              {rowActions && <TableHead className="text-center" role="columnheader">إجراءات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} role="row">
                  {showCheckboxes && <TableCell role="gridcell"><div className="h-4 w-4 bg-muted animate-pulse rounded" /></TableCell>}
                  {visibleCols.map((_, j) => (
                    <TableCell key={j} role="gridcell"><div className="h-4 w-full bg-muted animate-pulse rounded" /></TableCell>
                  ))}
                  {rowActions && <TableCell role="gridcell"><div className="h-8 w-8 bg-muted animate-pulse rounded mx-auto" /></TableCell>}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow role="row">
                <TableCell 
                  role="gridcell"
                  colSpan={colCount} 
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow 
                  key={item.id} 
                  role="row"
                  aria-selected={selectedIds.has(item.id)}
                  className={cn(
                    "group hover:bg-muted/50 transition-colors",
                    selectedIds.has(item.id) && "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  <DataTableRowComponent
                    item={item}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    density={density}
                    showCheckbox={showCheckboxes}
                    isSelected={selectedIds.has(item.id)}
                    onToggleSelect={onToggleSelectRow}
                    rowActions={rowActions}
                    customRowActions={customRowActions}
                  />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

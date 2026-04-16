import * as React from 'react';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataTableColumn, Density } from './types';

interface DataTableRowProps<T> {
  item: T;
  columns: DataTableColumn<T>[];
  visibleColumns: Set<string>;
  density: Density;
  showCheckbox?: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string | number) => void;
  rowActions?: (item: T) => React.ReactNode;
  customRowActions?: (item: T) => React.ReactNode;
}

const areEqual = <T extends { id: string | number }>(prev: DataTableRowProps<T>, next: DataTableRowProps<T>) => {
  if (prev.item.id !== next.item.id) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.density !== next.density) return false;
  if (prev.showCheckbox !== next.showCheckbox) return false;
  if (prev.visibleColumns !== next.visibleColumns) return false;
  if (prev.columns !== next.columns) return false;
  if (prev.rowActions !== next.rowActions) return false;
  if (prev.customRowActions !== next.customRowActions) return false;
  if (prev.onToggleSelect !== next.onToggleSelect) return false;
  
  // Deep check for item changes if needed (optimized for common case)
  for (const key in prev.item) {
    if (prev.item[key] !== next.item[key]) return false;
  }
  
  return true;
};

export const DataTableRowComponent = function DataTableRowComponent<T extends { id: string | number }>({
  item,
  columns,
  visibleColumns,
  density,
  showCheckbox,
  isSelected,
  onToggleSelect,
  rowActions,
  customRowActions,
}: DataTableRowProps<T>) {
  const visibleCols = React.useMemo(() => 
    columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden),
    [columns, visibleColumns]
  );
  
  return (
    <>
      {showCheckbox && (
        <TableCell role="gridcell">
          <input
            type="checkbox"
            className="rounded border-muted cursor-pointer"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={`تحديد الصف ${item.id}`}
          />
        </TableCell>
      )}
      {visibleCols.map((col) => (
        <TableCell 
          key={String(col.key)} 
          role="gridcell"
          className={cn(
            "text-right",
            density === 'compact' ? "py-1 px-2 text-xs" : "py-4 px-4"
          )}
        >
          {col.render 
            ? col.render((item as any)[col.key], item) 
            : String((item as any)[col.key] ?? '-')}
        </TableCell>
      ))}
      {(rowActions || customRowActions) && (
        <TableCell className="text-center" role="gridcell">
          <div className="flex items-center justify-center gap-2">
            {customRowActions && customRowActions(item)}
            {rowActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="قائمة الإجراءات">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {rowActions(item)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      )}
    </>
  );
};





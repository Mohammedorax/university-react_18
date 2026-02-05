import * as React from 'react';
import { List as VirtualList } from 'react-window';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataTableColumn, Density } from './types';

interface DataTableVirtualProps<T extends { id: string | number }> {
  data: T[];
  columns: DataTableColumn<T>[];
  visibleColumns: Set<string>;
  density: Density;
  height?: number;
  showCheckboxes?: boolean;
  selectedIds: Set<string | number>;
  onToggleSelectRow: (id: string | number) => void;
  rowActions?: (item: T) => React.ReactNode;
  customRowActions?: (item: T) => React.ReactNode;
}

export function DataTableVirtual<T extends { id: string | number }>({
  data,
  columns,
  visibleColumns,
  density,
  height = 400,
  showCheckboxes,
  selectedIds,
  onToggleSelectRow,
  rowActions,
  customRowActions,
}: DataTableVirtualProps<T>) {
  const listRef = React.useRef(null);

  const VirtualRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div style={style} className="flex border-b hover:bg-muted/30 transition-colors">
        {showCheckboxes && (
          <div className="flex items-center justify-center w-12 shrink-0 border-l px-4">
            <input
              type="checkbox"
              className="rounded border-muted cursor-pointer"
              checked={selectedIds.has(item.id)}
              onChange={() => onToggleSelectRow(item.id)}
              aria-label={`تحديد الصف ${item.id}`}
            />
          </div>
        )}
        {columns
          .filter(col => visibleColumns.has(String(col.key)) && !col.hidden)
          .map((col) => (
            <div 
              key={String(col.key)} 
              className={cn(
                "flex items-center text-right overflow-hidden text-ellipsis whitespace-nowrap px-4 border-l",
                density === 'compact' ? "py-1 text-xs" : "py-4",
                "flex-1"
              )}
            >
              {col.render 
                ? col.render((item as any)[col.key], item) 
                : String((item as any)[col.key] ?? '-')}
            </div>
          ))}
        {(rowActions || customRowActions) && (
          <div className="flex items-center justify-center w-20 shrink-0 border-l px-4">
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ height }}>
      {/* @ts-expect-error - react-window List types are outdated */}
      <VirtualList
        listRef={listRef}
        rowComponent={VirtualRow}
        rowCount={data.length}
        rowHeight={density === 'compact' ? 40 : 60}
        width="100%"
      />
    </div>
  );
}

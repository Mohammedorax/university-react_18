  import * as React from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
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

function createRowRenderer<T extends { id: string | number }>(
  data: T[],
  columns: DataTableColumn<T>[],
  visibleColumns: Set<string>,
  density: Density,
  showCheckboxes: boolean | undefined,
  selectedIds: Set<string | number>,
  onToggleSelectRow: (id: string | number) => void,
  rowActions: ((item: T) => React.ReactNode) | undefined,
  customRowActions: ((item: T) => React.ReactNode) | undefined,
) {
  return function Row({ index, style }: { index: number; style: React.CSSProperties }) {
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
}

export const DataTableVirtual = function DataTableVirtual<T extends { id: string | number }>({
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
  const itemSize = React.useMemo(() => 
    density === 'compact' ? 40 : 60,
    [density]
  );
  const Row = React.useMemo(
    () => createRowRenderer(
      data,
      columns,
      visibleColumns,
      density,
      showCheckboxes,
      selectedIds,
      onToggleSelectRow,
      rowActions,
      customRowActions,
    ),
    [data, columns, visibleColumns, density, showCheckboxes, selectedIds, onToggleSelectRow, rowActions, customRowActions],
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        لا توجد بيانات للعرض
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <AutoSizer
        renderProp={({ height: autoHeight, width: autoWidth }) => (
          <List
            height={autoHeight ?? 400}
            width={autoWidth ?? 800}
            rowCount={data.length}
            rowHeight={itemSize}
            rowComponent={Row}
            // @ts-expect-error - rowProps type mismatch with react-window types
            rowProps={{}}
            className="rtl"
            direction="rtl"
          />
        )}
      />
    </div>
  );
};







import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';
import type { DataTableColumn } from './types';

interface DataTableColumnsProps<T> {
  columns: DataTableColumn<T>[];
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
}

export function DataTableColumns<T>({ columns, visibleColumns, onToggleColumn }: DataTableColumnsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          الأعمدة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={String(col.key)}
            checked={visibleColumns.has(String(col.key))}
            onCheckedChange={() => onToggleColumn(String(col.key))}
          >
            {col.title}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';
import { DataTableSearch } from './DataTableSearch';
import { DataTableExport } from './DataTableExport';
import { DataTableColumns } from './DataTableColumns';
import type { DataTableColumn, Density } from './types';

interface DataTableHeaderProps<T> {
  columns: DataTableColumn<T>[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
  density: Density;
  onToggleDensity: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  exportDisabled?: boolean;
}

export function DataTableHeader<T>({
  columns,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  visibleColumns,
  onToggleColumn,
  density,
  onToggleDensity,
  onExportExcel,
  onExportPDF,
  onExportCSV,
  exportDisabled,
}: DataTableHeaderProps<T>) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-1">
      <DataTableSearch
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      <div className="flex items-center gap-2 w-full md:w-auto">
        <DataTableExport
          onExportExcel={onExportExcel}
          onExportPDF={onExportPDF}
          onExportCSV={onExportCSV}
          disabled={exportDisabled}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDensity}
          className="hidden md:flex gap-2"
          title={density === 'normal' ? "تبديل إلى العرض المضغوط" : "تبديل إلى العرض العادي"}
        >
          <LayoutGrid className="h-4 w-4" />
          {density === 'normal' ? 'عرض مضغوط' : 'عرض عادي'}
        </Button>

        <DataTableColumns
          columns={columns}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
        />
      </div>
    </div>
  );
}

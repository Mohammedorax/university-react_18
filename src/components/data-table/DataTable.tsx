import * as React from 'react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useTheme } from '@/components/ThemeProvider';
import { useDataTable } from './useDataTable';
import { useDataTableExport } from './useDataTableExport';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBulkActions } from './DataTableBulkActions';
import { DataTableBody } from './DataTableBody';
import { DataTableVirtual } from './DataTableVirtual';
import { DataTablePagination } from './DataTablePagination';
import type { DataTableProps } from './types';

export const DataTable = function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "بحث...",
  hideSearch = false,
  pageSize = 10,
  onRowSelection,
  rowActions,
  customRowActions,
  caption,
  isLoading = false,
  emptyMessage = "لا توجد بيانات لعرضها",
  bulkActions,
  virtualized = false,
  virtualHeight = 400,
  onPageChange,
  totalPages: externalTotalPages,
  currentPage: externalCurrentPage,
  totalItems: externalTotalItems,
}: DataTableProps<T>) {
  const { data: systemSettings } = useSettings();
  const { primaryColor } = useTheme();
  
  // Memoize table options to prevent hook recreation
  const tableOptions = React.useMemo(() => ({
    data,
    columns,
    pageSize,
    onRowSelection,
    onPageChange,
    externalCurrentPage,
    externalTotalPages,
  }), [data, columns, pageSize, onRowSelection, onPageChange, externalCurrentPage, externalTotalPages]);
  
  const {
    searchTerm,
    sortConfig,
    currentPage,
    selectedIds,
    density,
    visibleColumns,
    announcement,
    paginatedData,
    sortedData,
    totalPages,
    selectedItems,
    handleSort,
    handlePageClick,
    toggleSelectAll,
    toggleSelectRow,
    toggleColumnVisibility,
    handleSearchChange,
    clearSelection,
    toggleDensity,
  } = useDataTable(tableOptions);

  const { exportToCSV, exportToExcel, exportToPDF } = useDataTableExport(
    sortedData,
    columns,
    visibleColumns,
    systemSettings,
    primaryColor,
  );

  const showCheckboxes = React.useMemo(() => !!onRowSelection || !!bulkActions, [onRowSelection, bulkActions]);

  return (
    <div className="space-y-4 w-full" dir="rtl">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <DataTableHeader
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        hideSearch={hideSearch}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumnVisibility}
        density={density}
        onToggleDensity={toggleDensity}
        onExportExcel={exportToExcel}
        onExportPDF={exportToPDF}
        onExportCSV={exportToCSV}
        exportDisabled={sortedData.length === 0}
      />

      <DataTableBulkActions
        selectedCount={selectedIds.size}
        selectedItems={selectedItems}
        bulkActions={bulkActions}
        onClearSelection={clearSelection}
      />

      {virtualized ? (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden" role="region" aria-label="جدول البيانات">
          <DataTableVirtual
            data={sortedData}
            columns={columns}
            visibleColumns={visibleColumns}
            density={density}
            height={virtualHeight}
            showCheckboxes={showCheckboxes}
            selectedIds={selectedIds}
            onToggleSelectRow={toggleSelectRow}
            rowActions={rowActions}
            customRowActions={customRowActions}
          />
        </div>
      ) : (
        <DataTableBody
          data={paginatedData}
          columns={columns}
          visibleColumns={visibleColumns}
          density={density}
          sortConfig={sortConfig}
          selectedIds={selectedIds}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          showCheckboxes={showCheckboxes}
          rowActions={rowActions}
          customRowActions={customRowActions}
          caption={caption}
          onSort={handleSort}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      )}

      {!virtualized && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          externalTotalItems={externalTotalItems}
          pageSize={pageSize}
          sortedDataLength={sortedData.length}
          onPageChange={handlePageClick}
        />
      )}
    </div>
  );
};





import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableBulkActionsProps<T> {
  selectedCount: number;
  selectedItems: T[];
  bulkActions?: (selectedItems: T[]) => React.ReactNode;
  onClearSelection: () => void;
}

export function DataTableBulkActions<T>({
  selectedCount,
  selectedItems,
  bulkActions,
  onClearSelection,
}: DataTableBulkActionsProps<T>) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          تم تحديد {selectedCount} من العناصر
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="text-xs h-7"
        >
          إلغاء التحديد
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {bulkActions?.(selectedItems)}
      </div>
    </div>
  );
}

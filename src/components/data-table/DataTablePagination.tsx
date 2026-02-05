import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  externalTotalItems?: number;
  pageSize: number;
  sortedDataLength: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  externalTotalItems,
  pageSize,
  sortedDataLength,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null;

  const displayText = externalTotalItems !== undefined 
    ? `${Math.min(externalTotalItems, (currentPage - 1) * pageSize + 1)} إلى ${Math.min(externalTotalItems, currentPage * pageSize)} من أصل ${externalTotalItems}`
    : `${Math.min(sortedDataLength, (currentPage - 1) * pageSize + 1)} إلى ${Math.min(sortedDataLength, currentPage * pageSize)} من أصل ${sortedDataLength}`;

  return (
    <div 
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2"
      role="navigation"
      aria-label="التنقل بين صفحات الجدول"
    >
      <div className="text-sm text-muted-foreground">
        عرض {displayText} سجل
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="الصفحة الأولى"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                className={cn("h-8 w-8 p-0", currentPage === pageNum && "bg-primary text-primary-foreground")}
                onClick={() => onPageChange(pageNum)}
                aria-label={`الانتقال إلى الصفحة ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="الصفحة الأخيرة"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

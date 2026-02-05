import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';

interface DataTableExportProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  disabled?: boolean;
}

export function DataTableExport({ onExportExcel, onExportPDF, onExportCSV, disabled }: DataTableExportProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={disabled}
        >
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportExcel}>
          تصدير إلى Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
          تصدير إلى PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportCSV}>
          تصدير إلى CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

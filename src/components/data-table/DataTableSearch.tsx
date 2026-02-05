import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DataTableSearch({ value, onChange, placeholder = "بحث..." }: DataTableSearchProps) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
        aria-label="بحث في الجدول"
      />
    </div>
  );
}

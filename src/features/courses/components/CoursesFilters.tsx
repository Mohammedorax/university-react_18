import React from 'react';
import { Search, GraduationCap, RefreshCcw, Download, FileSpreadsheet, FileText, Loader2, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ViewModeButton } from '@/components/ViewModeButton';
import { cn } from '@/lib/utils';

interface CoursesFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedDepartment: string;
    setSelectedDepartment: (value: string) => void;
    departments: string[];
    handleRefresh: () => void;
    handleResetFilters?: () => void;
    handleExport: (type: 'Excel' | 'PDF') => void;
    isExporting: boolean;
    isRefetching: boolean;
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;
    setPage: (page: number) => void;
}

export const CoursesFilters: React.FC<CoursesFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    departments,
    handleRefresh,
    handleExport,
    isExporting,
    isRefetching,
    viewMode,
    setViewMode,
    setPage,
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]">
            {/* Search */}
            <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                <Input
                    placeholder="بحث عن مقرر دراسي..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className="input-unified pr-11 font-medium"
                    aria-label="البحث عن المقررات"
                />
            </div>

            {/* Department */}
            <Select value={selectedDepartment} onValueChange={(val) => {
                setSelectedDepartment(val);
                setPage(1);
            }}>
                <SelectTrigger className="input-unified font-bold" aria-label="تصفية حسب القسم">
                    <div className="flex items-center gap-2.5">
                        <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <SelectValue placeholder="اختر القسم" />
                    </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-muted shadow-2xl">
                    <SelectItem value="all" className="font-bold">جميع الأقسام</SelectItem>
                    {departments.map(dept => (
                        <SelectItem key={dept} value={dept} className="font-bold">{dept}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1 justify-end flex-wrap">
                <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                        "h-12 w-12 rounded-xl shadow-md transition-all active:scale-95",
                        isRefetching && "animate-spin"
                    )}
                    onClick={handleRefresh}
                    aria-label="تحديث البيانات"
                    disabled={isRefetching}
                >
                    <RefreshCcw size={20} aria-hidden="true" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-12 px-5 rounded-xl gap-2 font-bold border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm active:scale-95"
                            disabled={isExporting}
                            aria-label="تصدير البيانات"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            تصدير
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] shadow-2xl border-muted">
                        <DropdownMenuItem onClick={() => handleExport('Excel')} className="rounded-xl gap-3 font-bold p-3 cursor-pointer">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            تصدير Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('PDF')} className="rounded-xl gap-3 font-bold p-3 cursor-pointer">
                            <FileText className="h-4 w-4 text-red-600" />
                            تصدير PDF
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center bg-muted/30 dark:bg-muted/20 rounded-xl p-1 h-12" role="group" aria-label="تغيير وضع العرض">
                    <ViewModeButton
                        active={viewMode === 'grid'}
                        onClick={() => setViewMode('grid')}
                        icon={<LayoutGrid size={20} />}
                        label="شبكة"
                    />
                    <ViewModeButton
                        active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                        icon={<List size={20} />}
                        label="جدول"
                    />
                </div>
            </div>
        </div>
    );
};

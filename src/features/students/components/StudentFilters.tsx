import { Search, Filter, BookOpen, List, LayoutGrid, RefreshCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ViewModeButton } from '@/components/ViewModeButton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface StudentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedDepartment: string;
    setSelectedDepartment: (value: string) => void;
    selectedYear: string;
    setSelectedYear: (value: string) => void;
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    onReset: () => void;
    departments: string[];
    years: string[];
}

export function StudentFilters({
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedYear,
    setSelectedYear,
    viewMode,
    setViewMode,
    onReset,
    departments,
    years,
}: StudentFiltersProps) {
    return (
        <Card className="card-unified mb-8" role="search" aria-label="فلاتر البحث والتصفية">
            <CardContent className="p-4 lg:p-6">
                <div className="filter-container">
                    <div className="relative group lg:col-span-2">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} aria-hidden="true" />
                        <Input
                            placeholder="بحث عن طالب بالاسم أو الرقم الجامعي..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-unified pr-12 font-bold"
                            aria-label="البحث عن طريق اسم الطالب أو الرقم الجامعي"
                        />
                    </div>

                    <div className="relative">
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="input-unified font-bold" aria-label="تصفية حسب القسم">
                                <div className="flex items-center gap-3">
                                    <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <SelectValue placeholder="كل الأقسام" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-muted shadow-2xl">
                                <SelectItem value="all" className="font-bold">كل الأقسام</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept} className="font-bold">{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="input-unified font-bold" aria-label="تصفية حسب السنة الدراسية">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <SelectValue placeholder="كل السنوات" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-muted shadow-2xl">
                                <SelectItem value="all" className="font-bold">كل السنوات</SelectItem>
                                {years.map(year => (
                                    <SelectItem key={year} value={year} className="font-bold">السنة {year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-2">
                        <div className="flex bg-muted/30 dark:bg-muted/20 p-1 rounded-xl h-12 flex-1" role="group" aria-label="تبديل وضع العرض">
                            <ViewModeButton
                                active={viewMode === 'table'}
                                onClick={() => setViewMode('table')}
                                icon={List}
                                label="جدول"
                                className="flex-1 h-full"
                            />
                            <ViewModeButton
                                active={viewMode === 'grid'}
                                onClick={() => setViewMode('grid')}
                                icon={LayoutGrid}
                                label="شبكة"
                                className="flex-1 h-full"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all active:scale-95 dark:border-muted-foreground/30"
                            onClick={onReset}
                            aria-label="إعادة ضبط الفلاتر"
                            title="إعادة ضبط الفلاتر"
                        >
                            <RefreshCcw size={18} />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

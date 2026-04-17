import { Search, Filter, List, LayoutGrid, RefreshCcw } from 'lucide-react'
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

interface TeacherFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedDepartment: string;
    setSelectedDepartment: (value: string) => void;
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    onReset: () => void;
    departments: string[];
    resultsCountMessage?: string;
}

export function TeacherFilters({
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    viewMode,
    setViewMode,
    onReset,
    departments,
    resultsCountMessage,
}: TeacherFiltersProps) {
    return (
        <Card className="card-unified mb-8" role="region" aria-label="أدوات البحث والتصفية">
            <CardContent className="p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.8fr)_auto]">
                    <div className="relative group min-w-0">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} aria-hidden="true" />
                        <Input
                            placeholder="بحث عن مدرس بالاسم أو التخصص..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-unified h-12 pr-12 font-bold"
                            aria-label="بحث عن مدرس بالاسم أو التخصص"
                            aria-describedby="search-results-count"
                        />
                    </div>

                    <div className="relative min-w-0">
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="input-unified h-12 font-bold" aria-label="تصفية حسب القسم">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <SelectValue placeholder="القسم الإداري" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-muted shadow-2xl">
                                <SelectItem value="all" className="font-bold">جميع الأقسام</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept} className="font-bold">{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <div className="flex h-12 items-center rounded-xl border bg-muted/30 p-1 dark:bg-muted/20" role="group" aria-label="وضع العرض: جدول أو شبكة">
                            <ViewModeButton
                                active={viewMode === 'table'}
                                onClick={() => setViewMode('table')}
                                icon={List}
                                label="جدول"
                            />
                            <ViewModeButton
                                active={viewMode === 'grid'}
                                onClick={() => setViewMode('grid')}
                                icon={LayoutGrid}
                                label="شبكة"
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
                        {resultsCountMessage && (
                            <div id="search-results-count" className="sr-only" aria-live="polite">
                                {resultsCountMessage}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

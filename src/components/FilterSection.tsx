import { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

export interface FilterSectionProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    searchPlaceholder?: string
    departments?: string[]
    selectedDepartment: string
    onDepartmentChange: (value: string) => void
    resetButton?: ReactNode
}

export function FilterSection({
    searchTerm,
    onSearchChange,
    searchPlaceholder = "البحث...",
    departments,
    selectedDepartment,
    onDepartmentChange,
    resetButton
}: FilterSectionProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-muted/50">
            <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pr-10 bg-background border-none focus-visible:ring-primary rounded-xl h-11 font-medium"
                    aria-label={searchPlaceholder}
                />
            </div>

            {departments && departments.length > 0 && (
                <div className="w-full sm:w-auto">
                    <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                        <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background border-none focus:ring-primary/20 rounded-xl font-bold">
                            <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-muted shadow-2xl">
                            <SelectItem value="all">جميع الأقسام</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {resetButton && <div className="ml-auto">{resetButton}</div>}
        </div>
    )
}

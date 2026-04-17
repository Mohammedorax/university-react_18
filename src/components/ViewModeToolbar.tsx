import { Input } from '@/components/ui/input'
import { ViewModeButton } from '@/components/ViewModeButton'
import { LayoutGrid, List, Search } from 'lucide-react'

interface ViewModeToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    viewMode: 'table' | 'grid'
    onViewModeChange: (mode: 'table' | 'grid') => void
    searchPlaceholder?: string
}

export function ViewModeToolbar({
    searchValue,
    onSearchChange,
    viewMode,
    onViewModeChange,
    searchPlaceholder = 'بحث...',
}: ViewModeToolbarProps) {
    return (
        <div className="flex w-full flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="pr-10"
                    placeholder={searchPlaceholder}
                />
            </div>
            <div className="flex items-center rounded-xl border bg-muted/50 p-1">
                <ViewModeButton active={viewMode === 'table'} onClick={() => onViewModeChange('table')} icon={List} label="جدول" />
                <ViewModeButton active={viewMode === 'grid'} onClick={() => onViewModeChange('grid')} icon={LayoutGrid} label="شبكة" />
            </div>
        </div>
    )
}


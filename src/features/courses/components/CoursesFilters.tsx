import { useState, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button as UIButton } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ViewModeButton } from '@/components/ViewModeButton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, GraduationCap, RefreshCcw, Download, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Course } from '../types'

interface CoursesFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedDepartment: string
  setSelectedDepartment: (value: string) => void
  viewMode: 'grid' | 'table'
  setViewMode: (mode: 'grid' | 'table') => void
  page: number
  setPage: (page: number) => void
  isRefetching: boolean
  handleRefresh: () => void
  handleResetFilters: () => void
  handleExport: (type: 'Excel' | 'PDF') => void
  isExporting: boolean
  departments: string[]
  totalItems: number
}

export const CoursesFilters = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  viewMode,
  setViewMode,
  page,
  setPage,
  isRefetching,
  handleRefresh,
  handleResetFilters,
  handleExport,
  isExporting,
  departments,
  totalItems
}: CoursesFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
          <Input
            placeholder="\u0628\u062d\u062b \u0639\u0646 \u0645\u0642\u0631\u0631..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="h-12 pr-11 rounded-2xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary transition-all font-medium"
            aria-label="\u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0645\u0642\u0631\u0631\u0627\u062a"
          />
        </div>

        <Select value={selectedDepartment} onValueChange={(val) => {
          setSelectedDepartment(val)
          setPage(1)
        }}>
          <SelectTrigger className="h-12 w-full md:w-56 rounded-2xl bg-muted/50 border-none font-bold focus:ring-2 focus:ring-primary transition-all" aria-label="\u062a\u0635\u0641\u064a\u0629 \u062d\u0633\u0628 \u0627\u0644\u0642\u0633\u0645">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <SelectValue placeholder="\u0627\u062e\u062a\u0631 \u0627\u0644\u0642\u0633\u0645" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-muted shadow-2xl">
            <SelectItem value="all" className="font-bold">\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0645</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept} className="font-bold">{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
          <UIButton 
            variant="secondary" 
            size="icon" 
            className={cn(
              "rounded-2xl h-12 w-12 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
              isRefetching && "animate-spin"
            )} 
            onClick={handleRefresh}
            aria-label="\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0628\u064a\u0627\u0646\u0627"
            disabled={isRefetching}
          </UIButton>
          <RefreshCcw size={20} aria-hidden="true" />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 rounded-2xl border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all focus-visible:ring-destructive focus-visible:ring-offset-2"
          onClick={handleResetFilters}
          aria-label="\u0625\u0639\u0627\u062f\u0629 \u0636\u0628\u0637 \u0627\u0644\u0641\u0644\u062a\u0631\u0627\u062a"
          title="\u0625\u0639\u0627\u062f\u0629 \u0636\u0628\u0637 \u0627\u0644\u0641\u0644\u062a\u0631\u0627\u062a"
        >
          <RefreshCcw size={18} className="-rotate-90" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="h-12 px-6 rounded-2xl gap-2 font-bold border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
              disabled={isExporting}
              aria-label="\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a"
            >
              {isExporting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              \u062a\u0635\u062f\u064a\u0631
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] shadow-2xl border-muted">
            <DropdownMenuItem onClick={() => handleExport('Excel')} className="rounded-xl gap-3 font-bold p-3 cursor-pointer">
              <Download className="h-4 w-4 text-green-600" />
              \u062a\u0635\u062f\u064a\u0631 Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('PDF')} className="rounded-xl gap-3 font-bold p-3 cursor-pointer">
              <Download className="h-4 w-4 text-red-600" />
              \u062a\u0635\u062f\u064a\u0631 PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center bg-muted/50 rounded-2xl border p-1.5 shadow-inner ml-2" role="group" aria-label="\u062a\u063a\u064a\u064a\u0631 \u0648\u0636\u0639 \u0627\u0644\u0639\u0631\u0636">
          <ViewModeButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')} 
            icon={<LayoutGrid size={20} />} 
            label="\u0639\u0631\u0636 \u0634\u0628\u0643\u064a" 
          />
          <ViewModeButton 
            active={viewMode === 'table'} 
            onClick={() => setViewMode('table')} 
            icon={<List size={20} />} 
            label="\u0639\u0631\u0636 \u062c\u062f\u0648\u0644\u064a" 
          />
        </div>
      </div>
    </div>
  )
}
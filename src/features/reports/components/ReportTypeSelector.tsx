import { memo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

interface ReportTypeSelectorProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { value: 'general', label: 'توزيع البيانات', icon: BarChart3 },
  { value: 'academic', label: 'الأداء الأكاديمي', icon: TrendingUp },
  { value: 'attendance', label: 'الحضور والغياب', icon: Calendar },
]

export const ReportTypeSelector = memo(function ReportTypeSelector({
  activeTab,
  onTabChange
}: ReportTypeSelectorProps) {
  return (
    <div className="flex justify-center">
      <div className="bg-card p-2 rounded-2xl shadow-2xl border border-border inline-block">
        <Tabs value={activeTab} onValueChange={onTabChange} dir="rtl">
          <TabsList className="bg-transparent h-auto p-0 gap-2" aria-label="تبويبات التقارير">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-3 rounded-xl transition-all font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={tab.label}
              >
                <tab.icon size={18} aria-hidden="true" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
})

export default ReportTypeSelector

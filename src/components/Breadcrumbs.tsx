import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeLabels: Record<string, string> = {
  admin: 'الإدارة',
  dashboard: 'لوحة التحكم',
  students: 'الطلاب',
  teachers: 'المدرسين',
  staff: 'الموظفين',
  courses: 'المقررات',
  reports: 'التقارير',
  inventory: 'المخزون',
  schedule: 'الجدول الدراسي',
  profile: 'الملف الشخصي',
  settings: 'الإعدادات',
  finance: 'المالية',
  discounts: 'الخصومات والمنح',
  grades: 'الدرجات',
}     

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  if (pathnames.length === 0) return null

  return (
    <nav 
      className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6 animate-in fade-in slide-in-from-right-4 duration-500"
      aria-label="مسار التنقل"
    >
      <Link
        to="/"
        className="flex items-center hover:text-primary transition-colors gap-1"
      >
        <Home size={14} />
        <span className="sr-only">الرئيسية</span>
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const label = routeLabels[value] || value

        return (
          <div key={to} className="flex items-center gap-2">
            <ChevronLeft size={14} className="text-muted-foreground/50" />
            {last ? (
              <span className="font-bold text-foreground">{label}</span>
            ) : (
              <Link
                to={to}
                className="hover:text-primary transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

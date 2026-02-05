import { useAppSelector } from '@/store'
import { selectTotalItems } from '@/features/courses/slice/coursesSlice'

export const useAccessibilityAnnouncements = () => {
  const totalItems = useAppSelector(selectTotalItems)
  
  const announceNavigation = (page: number, total: number, searchTerm?: string) => {
    const message = searchTerm 
      ? `تم العثور على ${total} نتيجة للبحث عن "${searchTerm}"`
      : `تم عرض ${total} عنصر، الصفحة ${page}`
    
    announceToScreenReader(message)
  }
  
  const announceFilterChange = (filterType: string, value: string) => {
    const message = `تم تغيير ${filterType} إلى ${value}`
    announceToScreenReader(message)
  }
  
  const announceAction = (action: string, target: string) => {
    const message = `تم ${action} ${target} بنجاح`
    announceToScreenReader(message)
  }
  
  const announceError = (error: string) => {
    announceToScreenReader(`خطأ: ${error}`)
  }
  
  const announceLoading = (state: 'loading' | 'success' | 'error') => {
    const messages = {
      loading: 'جاري التحميل...',
      success: 'تم التحميل بنجاح',
      error: 'حدث خطأ أثناء التحميل'
    }
    announceToScreenReader(messages[state])
  }
  
  return {
    announceNavigation,
    announceFilterChange,
    announceAction,
    announceError,
    announceLoading
  }
}

// دالة مساعدة لإعلانات قارئ الشاشة
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}
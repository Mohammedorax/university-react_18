import { useSettings } from '@/features/settings/hooks/useSettings'

export const useRTL = () => {
    const { data: systemSettings } = useSettings()
    const direction = systemSettings?.direction || 'rtl'
    return direction === 'rtl'
}
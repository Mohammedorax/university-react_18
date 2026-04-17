import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useEffect } from 'react'

import { useRTL } from '@/hooks/useRTL'

const MainLayout = () => {
    const isRTL = useRTL()

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
        document.documentElement.lang = isRTL ? 'ar' : 'en'
    }, [isRTL])

    return (
        <>
            <Outlet />
            <Toaster />
        </>
    )
}

export default MainLayout

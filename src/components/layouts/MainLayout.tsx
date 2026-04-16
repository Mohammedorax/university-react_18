import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

import { useRTL } from '@/hooks/useRTL'

const MainLayout = () => {
    const isRTL = useRTL()
    return (
        <>
            <Outlet />
            <Toaster />
        </>
    )
}

export default MainLayout

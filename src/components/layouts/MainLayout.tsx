import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

const MainLayout = () => {
    return (
        <>
            <Outlet />
            <Toaster />
        </>
    )
}

export default MainLayout

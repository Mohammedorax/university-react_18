import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw } from 'lucide-react'

export interface DashboardHeroProps {
    title: string
    description: string
    icon?: ReactNode
    action?: {
        label: string
        onClick: () => void
        disabled?: boolean
        isLoading?: boolean
    }
    stats?: Array<{
        label: string
        value: string | number
        icon?: ReactNode
    }>
}

export function DashboardHero({ title, description, icon, action, stats }: DashboardHeroProps) {
    return (
        <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-24 pt-10">
            {icon && (
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    {icon}
                </div>
            )}
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="text-center md:text-right">
                        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">{title}</h1>
                        <p className="text-primary-foreground/80 text-lg">{description}</p>
                    </div>
                    {action && (
                        <Button
                            onClick={action.onClick}
                            disabled={action.disabled || action.isLoading}
                            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm transition-all hover:scale-105"
                        >
                            {action.isLoading ? (
                                <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    جاري التحميل...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="ml-2 h-4 w-4" />
                                    {action.label}
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" role="region" aria-label="إحصائيات سريعة">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10 flex items-center gap-4 transition-all hover:bg-primary-foreground/15 shadow-lg">
                                {stat.icon && (
                                    <div className="p-3 bg-primary-foreground/20 rounded-xl">
                                        {stat.icon}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm opacity-80 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                                    <p className="text-2xl font-black">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

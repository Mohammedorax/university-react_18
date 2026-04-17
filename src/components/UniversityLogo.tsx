import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

type UniversityLogoProps = {
    className?: string
    /** إخفاء النص البديل للشاشات — يُفضَّل false عندما يكون الشعار وحيداً */
    decorative?: boolean
}

/**
 * شعار الجامعة: يعرض الشعار المخصص من الثيم أو الشعار الافتراضي من `public/assets/`.
 * عند فشل التحميل يُعرض أيقونة القبعة كاحتياط.
 */
export function UniversityLogo({ className, decorative = true }: UniversityLogoProps) {
    const { displayLogo } = useTheme()
    const [broken, setBroken] = useState(false)

    if (broken) {
        return (
            <span className={cn('inline-flex items-center justify-center rounded-xl', className)} aria-hidden={decorative}>
                <GraduationCap className="h-[62%] w-[62%] text-primary" aria-hidden="true" />
            </span>
        )
    }

    return (
        <img
            src={displayLogo}
            alt={decorative ? '' : 'شعار الجامعة'}
            className={cn('rounded-xl object-contain', className)}
            decoding="async"
            aria-hidden={decorative || undefined}
            onError={() => setBroken(true)}
        />
    )
}

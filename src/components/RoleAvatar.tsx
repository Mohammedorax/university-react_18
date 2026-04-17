import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Briefcase, GraduationCap, Presentation, Shield } from 'lucide-react'

type Role = 'student' | 'teacher' | 'staff' | 'admin'

const roleIconMap = {
    student: GraduationCap,
    teacher: Presentation,
    staff: Briefcase,
    admin: Shield,
} as const

interface RoleAvatarProps {
    userRole: Role
    name?: string
    image?: string | null
    className?: string
}

export function RoleAvatar({ userRole, name, image, className }: RoleAvatarProps) {
    const Icon = roleIconMap[userRole]
    return (
        <Avatar className={className}>
            {image ? <AvatarImage src={image} alt={name || userRole} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
            </AvatarFallback>
        </Avatar>
    )
}


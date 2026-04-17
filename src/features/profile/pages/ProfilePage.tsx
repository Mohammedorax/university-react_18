import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthState, useUpdateProfile } from '@/features/auth/hooks/useAuth'
import { useUpdateStudent } from '@/features/students/hooks/useStudents'
import { useUpdateTeacher } from '@/features/teachers/hooks/useTeachers'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, User, Mail, Shield, Key, Eye, EyeOff } from 'lucide-react'

const profileSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل').optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
})

type ProfileFormValues = z.infer<typeof profileSchema>

/**
 * @page ProfilePage
 * @description صفحة الملف الشخصي للمستخدم.
 * تتيح للمستخدم استعراض وتحديث بياناته الشخصية مثل الاسم والبريد الإلكتروني،
 * بالإضافة إلى إمكانية تغيير كلمة المرور بأمان.
 * 
 * @returns {JSX.Element} صفحة الملف الشخصي
 */
const ProfilePage = () => {
    const { user } = useAuthState()
    const updateProfileMutation = useUpdateProfile()
    const updateStudentMutation = useUpdateStudent()
    const updateTeacherMutation = useUpdateTeacher()

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const isLoading = updateProfileMutation.isPending || updateStudentMutation.isPending || updateTeacherMutation.isPending

    const defaultValues: Partial<ProfileFormValues> = {
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
    })

    /**
     * معالجة إرسال نموذج تحديث الملف الشخصي
     * @param {ProfileFormValues} data - بيانات النموذج المرسلة
     */
    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return

        try {
            const updateData: { name: string; email: string; password?: string } = {
                name: data.name,
                email: data.email,
            }

            if (data.newPassword) {
                updateData.password = data.newPassword
            }

            // في التطبيق الحقيقي، يجب التحقق من كلمة المرور الحالية هنا أو في الخادم

            if (user.role === 'student') {
                await updateStudentMutation.mutateAsync({ id: user.id, data: updateData })
            } else if (user.role === 'teacher') {
                await updateTeacherMutation.mutateAsync({ id: user.id, data: updateData })
            }
            
            // تحديث حالة المصادقة والتخزين المحلي عبر الطفرة (Mutation)
            await updateProfileMutation.mutateAsync({
                name: data.name,
                email: data.email
            })

            toast.success('تم تحديث الملف الشخصي بنجاح')
            reset({ ...data, currentPassword: '', newPassword: '', confirmPassword: '' })

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الملف الشخصي'
            toast.error(message)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10" role="region" aria-label="رأس الملف الشخصي">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <User size={300} aria-hidden="true" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="bg-primary-foreground/10 backdrop-blur-md p-4 rounded-2xl border border-primary-foreground/20 shadow-xl">
                            <User size={48} className="text-primary-foreground" aria-hidden="true" />
                        </div>
                        <div className="text-center md:text-right">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">الملف الشخصي</h1>
                            <p className="text-primary-foreground/80 text-lg">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 sm:-mt-16 relative z-20">
                <Card className="max-w-3xl mx-auto shadow-xl border-none">
                    <CardHeader className="border-b bg-muted/30 pb-6">
                        <CardTitle>بيانات الحساب</CardTitle>
                        <CardDescription>
                            قم بتحديث معلوماتك الشخصية وكلمة المرور
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                        الاسم الكامل
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        disabled={isLoading}
                                        className="bg-muted/30"
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive" role="alert">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                        البريد الإلكتروني
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        disabled={true}
                                        className="bg-muted"
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                                    الأمان وكلمة المرور
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                                        <div className="relative">
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                {...register('currentPassword')}
                                                disabled={isLoading}
                                                className="pr-10 pl-10 bg-muted/30"
                                                aria-invalid={!!errors.currentPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
                                                aria-label={showCurrentPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                            >
                                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="text-sm text-destructive" role="alert">{errors.currentPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">كلمة المرور الجديدة (اختياري)</Label>
                                        <div className="relative">
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                {...register('newPassword')}
                                                disabled={isLoading}
                                                className="pr-10 pl-10 bg-muted/30"
                                                placeholder="اتركها فارغة إذا لم ترد التغيير"
                                                aria-invalid={!!errors.newPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
                                                aria-label={showNewPassword ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"}
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="text-sm text-destructive" role="alert">{errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                                        <div className="relative">
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                {...register('confirmPassword')}
                                                disabled={isLoading}
                                                className="pr-10 pl-10 bg-muted/30"
                                                placeholder="أعد كتابة كلمة المرور الجديدة"
                                                aria-invalid={!!errors.confirmPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
                                                aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-sm text-destructive" role="alert">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={isLoading} className="min-w-[150px] gap-2" aria-label="حفظ تغييرات الملف الشخصي">
                                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                                    حفظ التغييرات
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ProfilePage

import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { Loader2, Mail, Lock, Eye, EyeOff, GraduationCap, ShieldCheck, BookOpen, Users } from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { sanitizeText, isValidEmail, containsDangerousContent, getCSRFToken, detectInjectionAttempt } from '@/lib/security'

/**
 * مخطط التحقق من صحة بيانات تسجيل الدخول باستخدام Zod
 */
const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/** حسابات تجريبية للعرض والاختبار */
const DEMO_ACCOUNTS = [
    {
        role: 'مسؤول',
        email: 'admin@university.edu',
        password: 'password',
        icon: ShieldCheck,
        color: 'bg-rose-500/10 text-rose-600 border-rose-200',
    },
    {
        role: 'مدرس',
        email: 'teacher@university.edu',
        password: 'password',
        icon: BookOpen,
        color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
        role: 'طالب',
        email: 'student@university.edu',
        password: 'password',
        icon: Users,
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
]

/**
 * @page LoginPage
 * @description صفحة تسجيل الدخول للنظام مع دعم الحسابات التجريبية.
 */
export default function LoginPage() {
    const navigate = useNavigate()
    const loginMutation = useLogin()
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const { errors } = form.formState

    useEffect(() => {
        const errorKeys = Object.keys(errors)
        if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0]
            const element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey)
            if (element) {
                element.focus()
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [errors])

    const onSubmit = (data: LoginFormValues) => {
        const sanitizedEmail = sanitizeText(data.email)
        const sanitizedPassword = sanitizeText(data.password)
        const sanitizedData: LoginFormValues = {
            email: sanitizedEmail,
            password: sanitizedPassword,
        }

        if (!isValidEmail(sanitizedData.email)) {
            form.setError('email', { type: 'manual', message: 'البريد الإلكتروني غير صالح' })
            return
        }

        if (containsDangerousContent(sanitizedData.email)) {
            form.setError('email', { type: 'manual', message: 'تم اكتشاف محتوى غير آمن' })
            return
        }

        if (containsDangerousContent(sanitizedData.password)) {
            form.setError('password', { type: 'manual', message: 'تم اكتشاف محتوى غير آمن' })
            return
        }

        loginMutation.mutate({ email: sanitizedData.email, password: sanitizedData.password })
    }

    const fillDemo = (email: string, password: string) => {
        form.setValue('email', email)
        form.setValue('password', password)
        form.clearErrors()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-background dark:to-muted p-4" dir="rtl" lang="ar" role="main" aria-labelledby="login-title">
            <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="space-y-4 pb-6 text-center">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 transition-transform hover:scale-105">
                            <GraduationCap className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle asChild>
                        <h1 id="login-title" className="text-3xl font-black tracking-tight">مرحباً بك</h1>
                    </CardTitle>
                    <CardDescription className="text-base">
                        أدخل بياناتك للوصول إلى لوحة التحكم
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-right block">البريد الإلكتروني</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="student@university.edu"
                                                    className="pr-10 text-right rounded-xl h-12 focus:ring-primary/20 transition-all"
                                                    disabled={loginMutation.isPending}
                                                    aria-required="true"
                                                    autoComplete="email"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-right block">كلمة المرور</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                <Input
                                                    {...field}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pr-10 pl-10 text-right rounded-xl h-12 focus:ring-primary/20 transition-all"
                                                    disabled={loginMutation.isPending}
                                                    aria-required="true"
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1 transition-colors"
                                                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />

                            {/* Demo Accounts Section */}
                            <div className="pt-2">
                                <p className="text-xs text-center text-muted-foreground mb-3 font-medium">حسابات تجريبية للتجربة السريعة</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {DEMO_ACCOUNTS.map((acc) => (
                                        <button
                                            key={acc.role}
                                            type="button"
                                            onClick={() => fillDemo(acc.email, acc.password)}
                                            disabled={loginMutation.isPending}
                                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97] ${acc.color}`}
                                            aria-label={`تسجيل الدخول كـ ${acc.role}`}
                                        >
                                            <acc.icon size={16} aria-hidden="true" />
                                            {acc.role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loginMutation.isPending}
                                aria-busy={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center" role="status">
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                        <span>جاري تسجيل الدخول...</span>
                                    </div>
                                ) : 'تسجيل الدخول'}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground pt-1" aria-label="روابط بديلة">
                                ليس لديك حساب؟{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                                    aria-label="الانتقال لصفحة إنشاء حساب جديد"
                                >
                                    إنشاء حساب جديد
                                </button>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

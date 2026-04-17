import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, BookOpen, Users } from 'lucide-react'
import { UniversityLogo } from '@/components/UniversityLogo'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { sanitizeText, isValidEmail, containsDangerousContent } from '@/lib/security'

const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = [
    {
        role: 'مسؤول',
        email: 'admin@university.edu',
        password: '123456',
        icon: ShieldCheck,
        color: 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/15',
    },
    {
        role: 'مدرس',
        email: 'teacher@university.edu',
        password: '123456',
        icon: BookOpen,
        color: 'bg-muted text-foreground border-border hover:bg-accent',
    },
    {
        role: 'طالب',
        email: 'student@university.edu',
        password: '123456',
        icon: Users,
        color: 'bg-muted text-foreground border-border hover:bg-accent',
    },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const loginMutation = useLogin()
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
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

        if (!isValidEmail(sanitizedEmail)) {
            form.setError('email', { type: 'manual', message: 'البريد الإلكتروني غير صالح' })
            return
        }

        if (containsDangerousContent(sanitizedEmail)) {
            form.setError('email', { type: 'manual', message: 'تم اكتشاف محتوى غير آمن' })
            return
        }

        if (containsDangerousContent(sanitizedPassword)) {
            form.setError('password', { type: 'manual', message: 'تم اكتشاف محتوى غير آمن' })
            return
        }

        loginMutation.mutate({ email: sanitizedEmail, password: sanitizedPassword })
    }

    const fillDemo = (email: string, password: string) => {
        form.setValue('email', email)
        form.setValue('password', password)
        form.clearErrors()
    }

    return (
        <div
            className="flex w-full flex-col items-stretch justify-center"
            dir="rtl"
            lang="ar"
            role="main"
            aria-labelledby="login-title"
        >
            <Card className="w-full border border-border/80 shadow-xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl">
                <CardHeader className="space-y-2 px-4 pb-1 pt-4 text-center sm:px-6 sm:pt-5 sm:space-y-3">
                    <div className="flex justify-center">
                        <UniversityLogo className="h-20 w-32 sm:h-28 sm:w-44 transition-transform hover:scale-[1.02]" />
                    </div>
                    <CardTitle asChild>
                        <h1 id="login-title" className="text-2xl font-black tracking-tight sm:text-3xl">
                            مرحباً بك
                        </h1>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        أدخل بياناتك للوصول إلى لوحة التحكم
                    </CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                        <CardContent className="space-y-3 px-4 sm:px-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-right text-sm">البريد الإلكتروني</FormLabel>
                                        <FormControl>
                                            <div className="group relative">
                                                <Mail
                                                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                                                    aria-hidden="true"
                                                />
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="student@university.edu"
                                                    className="h-10 rounded-xl pr-10 text-right text-sm focus:ring-primary/20 sm:h-11 sm:pr-11 sm:text-base"
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
                                        <FormLabel className="block text-right text-sm">كلمة المرور</FormLabel>
                                        <FormControl>
                                            <div className="group relative">
                                                <Lock
                                                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                                                    aria-hidden="true"
                                                />
                                                <Input
                                                    {...field}
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-10 rounded-xl pr-10 pl-10 text-right text-sm focus:ring-primary/20 sm:h-11 sm:pr-11 sm:pl-11 sm:text-base"
                                                    disabled={loginMutation.isPending}
                                                    aria-required="true"
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-1">
                                <p className="mb-2 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                                    حسابات تجريبية للتجربة السريعة
                                </p>
                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                    {DEMO_ACCOUNTS.map((acc) => (
                                        <button
                                            key={acc.role}
                                            type="button"
                                            onClick={() => fillDemo(acc.email, acc.password)}
                                            disabled={loginMutation.isPending}
                                            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] sm:gap-1.5 sm:p-3 sm:text-xs ${acc.color}`}
                                            aria-label={`تسجيل الدخول كـ ${acc.role}`}
                                        >
                                            <acc.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                            {acc.role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-2.5 px-4 pb-5 pt-1 sm:px-6">
                            <Button
                                type="submit"
                                className="h-10 w-full rounded-xl text-sm font-bold shadow-md shadow-primary/15 transition-all hover:scale-[1.01] active:scale-[0.98] sm:h-11 sm:text-base"
                                disabled={loginMutation.isPending}
                                aria-busy={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center" role="status">
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                        <span>جاري تسجيل الدخول...</span>
                                    </div>
                                ) : (
                                    'تسجيل الدخول'
                                )}
                            </Button>
                            <div className="text-center text-xs text-muted-foreground sm:text-sm" aria-label="روابط بديلة">
                                ليس لديك حساب؟{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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

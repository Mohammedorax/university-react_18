import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { sanitizeText, isValidEmail, containsDangerousContent } from '@/lib/security'

/**
 * مخطط التحقق من صحة بيانات تسجيل الدخول باستخدام Zod
 */
const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * @page LoginPage
 * @description صفحة تسجيل الدخول للنظام.
 * تتيح للمستخدمين (طلاب، أساتذة، مسؤولين) الوصول إلى حساباتهم باستخدام البريد الإلكتروني وكلمة المرور.
 * يتم التحقق من البيانات باستخدام Zod و React Hook Form.
 * 
 * @returns {JSX.Element} صفحة تسجيل الدخول
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

    /**
     * التركيز على أول حقل يحتوي على خطأ عند فشل التحقق
     */
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

    /**
     * معالجة إرسال نموذج تسجيل الدخول مع حماية XSS
     * @param {LoginFormValues} data - بيانات النموذج (البريد الإلكتروني وكلمة المرور)
     */
    const onSubmit = (data: LoginFormValues) => {
        // تطهير المدخلات للحماية من XSS
        const sanitizedEmail = sanitizeText(data.email)
        const sanitizedData: LoginFormValues = {
            email: sanitizedEmail,
            password: data.password, // لا نحتاج لتطهير كلمة المرور
        }

        // التحقق من صحة البريد الإلكتروني
        if (!isValidEmail(sanitizedData.email)) {
            form.setError('email', {
                type: 'manual',
                message: 'البريد الإلكتروني غير صالح',
            })
            return
        }

        // التحقق من وجود محتوى خطر
        if (containsDangerousContent(sanitizedData.email)) {
            form.setError('email', {
                type: 'manual',
                message: 'تم اكتشاف محتوى غير آمن',
            })
            return
        }

        loginMutation.mutate({
            email: sanitizedData.email,
            password: sanitizedData.password,
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-background dark:to-muted p-4" dir="rtl" lang="ar" role="main" aria-labelledby="login-title">
            <Card className="w-full max-w-md shadow-2xl border-none">
                <CardHeader className="space-y-1 pb-8">
                    <CardTitle asChild>
                        <h1 id="login-title" className="text-3xl font-black text-center tracking-tight">تسجيل الدخول</h1>
                    </CardTitle>
                    <CardDescription className="text-center text-lg">
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
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
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
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6">
                            <Button 
                                type="submit" 
                                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" 
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
                            <div className="text-sm text-center text-muted-foreground pt-2" aria-label="روابط بديلة">
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

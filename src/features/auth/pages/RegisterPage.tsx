import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Mail, Hash, BookOpen, Lock, Eye, EyeOff } from 'lucide-react'
import { UniversityLogo } from '@/components/UniversityLogo'
import { useState } from 'react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from 'sonner'

/**
 * مخطط التحقق من صحة بيانات إنشاء الحساب باستخدام Zod
 */
const registerSchema = z.object({
    name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    universityId: z.string().min(4, 'الرقم الجامعي غير صحيح'),
    department: z.string().min(2, 'يرجى إدخال القسم الدراسي'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

/**
 * @page RegisterPage
 * @description صفحة إنشاء حساب جديد في النظام.
 * تتيح للطلاب الجدد التسجيل في نظام الجامعة من خلال إدخال بياناتهم الشخصية والأكاديمية.
 * يتم التحقق من صحة البيانات وتطابق كلمات المرور باستخدام Zod.
 * 
 * @returns {JSX.Element} صفحة إنشاء الحساب
 */
export default function RegisterPage() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            universityId: '',
            department: '',
            password: '',
            confirmPassword: '',
        },
    })

    /**
     * معالجة إرسال نموذج إنشاء الحساب
     * @param {RegisterFormValues} data - بيانات المستخدم الجديد
     */
    const onSubmit = async (data: RegisterFormValues) => {
        try {
            // محاكاة عملية التسجيل
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('تم إنشاء الحساب بنجاح')
            navigate('/login')
        } catch (error) {
            toast.error('حدث خطأ أثناء إنشاء الحساب')
        }
    }

    const isLoading = form.formState.isSubmitting
    const { errors } = form.formState

    /**
     * التركيز على أول حقل يحتوي على خطأ عند فشل التحقق
     */
    useEffect(() => {
        const errorKeys = Object.keys(errors)
        if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0]
            // البحث عن العنصر باستخدام الاسم أو المعرف
            const element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey)
            if (element) {
                element.focus()
                // التمرير إلى العنصر لضمان رؤيته
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [errors])

    return (
        <div className="flex w-full min-h-0 flex-col items-center justify-center" dir="rtl" lang="ar" role="main" aria-labelledby="register-title">
            <Card className="mx-auto w-full border border-border/60 shadow-md rounded-2xl">
                <CardHeader className="space-y-1.5 px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
                    <div className="flex justify-center">
                        <UniversityLogo className="h-16 w-28 sm:h-20 sm:w-36" />
                    </div>
                    <CardTitle asChild>
                        <h1 id="register-title" className="text-center text-lg font-black tracking-tight sm:text-xl">إنشاء حساب جديد</h1>
                    </CardTitle>
                    <CardDescription className="text-center text-[11px] sm:text-xs">
                        انضم إلى نظام إدارة الجامعة المتكامل
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-describedby="register-description">
                        <div id="register-description" className="sr-only">نموذج لإنشاء حساب طالب جديد يتطلب الاسم والبريد الإلكتروني والرقم الجامعي والقسم وكلمة المرور</div>
                        <CardContent className="space-y-2 px-3.5 pb-1 sm:px-4 sm:space-y-2.5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-right block">الاسم الكامل</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                <Input 
                                                    {...field} 
                                                    placeholder="أدخل اسمك الثلاثي" 
                                                    className="h-9 pr-9 text-right text-sm"
                                                    aria-required="true"
                                                    aria-invalid={!!errors.name}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-right block">البريد الإلكتروني الجامعي</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                <Input 
                                                    {...field} 
                                                    type="email" 
                                                    placeholder="example@university.edu" 
                                                    className="h-9 pr-9 text-right text-sm"
                                                    dir="ltr"
                                                    aria-required="true"
                                                    aria-invalid={!!errors.email}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5">
                                <FormField
                                    control={form.control}
                                    name="universityId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-right block">الرقم الجامعي</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                    <Input 
                                                        {...field} 
                                                        placeholder="2024XXXX" 
                                                        className="h-9 pr-9 text-right text-sm"
                                                        aria-required="true"
                                                        aria-invalid={!!errors.universityId}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-right" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-right block">القسم الدراسي</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                    <Input 
                                                        {...field} 
                                                        placeholder="مثال: علوم الحاسوب" 
                                                        className="h-9 pr-9 text-right text-sm"
                                                        aria-required="true"
                                                        aria-invalid={!!errors.department}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-right" />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
                                                    className="h-9 pr-9 pl-9 text-right text-sm"
                                                    aria-required="true"
                                                    aria-invalid={!!errors.password}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-right block">تأكيد كلمة المرور</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                                <Input 
                                                    {...field} 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    placeholder="••••••••" 
                                                    className="h-9 pr-9 pl-9 text-right text-sm"
                                                    aria-required="true"
                                                    aria-invalid={!!errors.confirmPassword}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                    aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-right" />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2 px-3.5 pb-3.5 pt-1 sm:px-4 sm:space-y-2.5 sm:pb-4">
                            <Button 
                                type="submit" 
                                className="h-9 w-full rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] sm:h-10 sm:text-sm" 
                                disabled={isLoading}
                                aria-live="polite"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                        جاري إنشاء الحساب...
                                    </>
                                ) : 'إنشاء حساب'}
                            </Button>
                            <div className="text-center text-xs text-muted-foreground">
                                لديك حساب بالفعل؟{' '}
                                <button 
                                    type="button"
                                    onClick={() => navigate('/login')} 
                                    className="text-primary font-bold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1"
                                >
                                    تسجيل الدخول
                                </button>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

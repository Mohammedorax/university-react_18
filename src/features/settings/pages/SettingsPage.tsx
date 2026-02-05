import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
    Loader2, 
    Info, 
    HelpCircle, 
    Bell, 
    Globe, 
    Lock, 
    User, 
    Languages, 
    Database, 
    Cloud,
    Settings,
    Save,
    Palette,
    Sun,
    Moon,
    Monitor,
    Calendar,
    ShieldAlert,
    RefreshCcw
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/useSettings'
import { useTheme } from '@/components/ThemeProvider'
import { SystemSettings } from '@/features/settings/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select'

/**
 * صفحة إعدادات النظام - تتيح للمسؤولين التحكم في الخيارات العامة، المظهر، الأمان، والتنبيهات
 * 
 * @component
 * @returns {JSX.Element} صفحة الإعدادات مع واجهة مستخدم محسنة وتدعم الوضع الداكن
 */
export default function SettingsPage() {
    const { data: settings, isLoading } = useSettings()
    const updateSettingsMutation = useUpdateSettings()
    const { theme, setTheme, primaryColor, setPrimaryColor, setLogo } = useTheme()
    
    const [formData, setFormData] = useState<Partial<SystemSettings>>({})
    const [activeSection, setActiveSection] = useState('general')

    useEffect(() => {
        if (settings) {
            setFormData({
                universityName: settings.universityName,
                currentSemester: settings.currentSemester,
                academicYear: settings.academicYear,
                contactEmail: settings.contactEmail
            })
        }
    }, [settings])

    /**
     * معالجة تغيير قيم حقول الإدخال النصية
     * @param {keyof SystemSettings} field - اسم الحقل المراد تحديثه
     * @param {string} value - القيمة الجديدة
     */
    const handleInputChange = (field: keyof SystemSettings, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    /**
     * حفظ التغييرات في الإعدادات العامة
     */
    const handleSave = () => {
        updateSettingsMutation.mutate(formData, {
            onSuccess: () => {
                toast.success('تم حفظ الإعدادات بنجاح', {
                    description: 'تمت مزامنة التغييرات مع الخادم'
                })
            },
            onError: (error: unknown) => {
                toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإعدادات')
            }
        })
    }

    /**
     * تبديل حالة الإعدادات المنطقية (Boolean)
     * @param {keyof SystemSettings} field - اسم الحقل المراد تبديله
     */
    const handleToggle = (field: keyof SystemSettings) => {
        if (!settings) return
        const newValue = !settings[field]
        updateSettingsMutation.mutate({ [field]: newValue }, {
            onSuccess: () => {
                const action = newValue ? 'تفعيل' : 'تعطيل'
                toast.success(`تم ${action} بنجاح`, {
                    description: `تم تحديث حالة ${getFieldName(field)}`
                })
            }
        })
    }

    /**
     * الحصول على اسم الحقل باللغة العربية لعرضه في رسائل التنبيه
     * @param {string} field - اسم الحقل البرمجي
     * @returns {string} الاسم بالعربية
     */
    const getFieldName = (field: string) => {
        switch (field) {
            case 'registrationEnabled': return 'التسجيل الذاتي'
            case 'gradingEnabled': return 'رصد الدرجات'
            case 'systemMaintenance': return 'وضع الصيانة'
            case 'emailNotifications': return 'إشعارات البريد الإلكتروني'
            case 'pushNotifications': return 'إشعارات المتصفح'
            case 'systemNotifications': return 'إشعارات النظام الداخلية'
            case 'academicNotifications': return 'التنبيهات الأكاديمية'
            case 'financialNotifications': return 'التنبيهات المالية'
            case 'administrativeNotifications': return 'التنبيهات الإدارية'
            default: return field
        }
    }

    const helpTexts: Record<string, string> = {
        universityName: "اسم الجامعة الرسمي الذي سيظهر في التقارير والشهادات",
        currentSemester: "الفصل الدراسي الحالي (خريف، ربيع، صيف)",
        registrationEnabled: "يسمح للطلاب بتسجيل المواد بأنفسهم من حساباتهم",
        gradingEnabled: "يسمح لأعضاء هيئة التدريس برصد وتعديل الدرجات",
        systemMaintenance: "إغلاق النظام مؤقتاً لإجراء عمليات الصيانة",
        theme: "تغيير مظهر النظام بالكامل ليناسب راحتك البصرية",
        primaryColor: "اللون الأساسي الذي سيستخدم في الأزرار والعناوين",
        emailNotifications: "إرسال تنبيهات هامة إلى بريدك الإلكتروني المسجل",
        pushNotifications: "إظهار تنبيهات منبثقة في المتصفح حتى عند عدم استخدام النظام",
        systemNotifications: "عرض التنبيهات في شريط التنبيهات داخل النظام",
        academicNotifications: "إشعارات تتعلق بالدرجات، الجدول الدراسي، والغياب",
        financialNotifications: "إشعارات تتعلق بالرسوم الدراسية، المنح، والخصومات",
        administrativeNotifications: "إشعارات تتعلق بالقرارات الإدارية والمواعيد العامة"
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 px-4 space-y-8 max-w-6xl" dir="rtl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Skeleton className="h-12 w-40 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="lg:col-span-9">
                        <Skeleton className="h-[500px] w-full rounded-3xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4" dir="rtl">
                <div className="bg-destructive/10 p-6 rounded-full w-20 h-20 flex items-center justify-center text-destructive">
                    <Info size={40} aria-hidden="true" />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل الإعدادات</h2>
                    <p className="text-muted-foreground mb-6">يرجى المحاولة مرة أخرى لاحقاً</p>
                </div>
                <Button onClick={() => window.location.reload()} className="gap-2 font-bold rounded-xl px-6 h-12">
                    <RefreshCcw size={16} aria-hidden="true" />
                    إعادة المحاولة
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl" role="main" aria-labelledby="settings-title">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 id="settings-title" className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl" aria-hidden="true">
                                <Settings className="h-8 w-8 text-primary" />
                            </div>
                            إعدادات النظام
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">قم بتخصيص وتحسين تجربة استخدام النظام وإدارة الخيارات العامة</p>
                    </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={updateSettingsMutation.isPending}
                        className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                        aria-label="حفظ كافة التغييرات"
                    >
                        {updateSettingsMutation.isPending ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Save className="ml-2 h-4 w-4" aria-hidden="true" />
                        )}
                        حفظ التغييرات
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:col-span-3 space-y-2" aria-label="أقسام الإعدادات">
                        <ul className="space-y-2 list-none p-0 m-0">
                            {[
                                { id: 'general', label: 'الإعدادات العامة', icon: Globe },
                                { id: 'appearance', label: 'المظهر والهوية', icon: Palette },
                                { id: 'security', label: 'الأمان والخصوصية', icon: Lock },
                                { id: 'notifications', label: 'التنبيهات', icon: Bell },
                                { id: 'system', label: 'حالة النظام', icon: Database },
                            ].map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveSection(item.id)}
                                        aria-current={activeSection === item.id ? 'page' : undefined}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                                            activeSection === item.id 
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" aria-hidden="true" />
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-6" aria-live="polite">
                        {activeSection === 'general' && (
                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden" role="region" aria-labelledby="general-settings-title">
                                <CardHeader className="pb-4">
                                    <CardTitle id="general-settings-title" className="text-xl">المعلومات الأساسية</CardTitle>
                                    <CardDescription className="font-medium">إعدادات هوية الجامعة والتقويم الأكاديمي</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="univ-name">اسم الجامعة</Label>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" aria-hidden="true" />
                                                <span className="sr-only">{helpTexts.universityName}</span>
                                            </div>
                                            <Input 
                                                id="univ-name"
                                                value={formData.universityName || ''} 
                                                onChange={(e) => handleInputChange('universityName', e.target.value)}
                                                className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20 font-medium"
                                                aria-describedby="univ-name-help"
                                            />
                                            <p id="univ-name-help" className="sr-only">{helpTexts.universityName}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="contact-email">بريد التواصل</Label>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" aria-hidden="true" />
                                            </div>
                                            <Input 
                                                id="contact-email"
                                                type="email"
                                                value={formData.contactEmail || ''} 
                                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                                className="rounded-xl h-11 border-muted-foreground/20 font-medium"
                                                aria-label="البريد الرسمي للدعم الفني والتواصل"
                                            />
                                        </div>
                                    </div>
                                    <Separator className="bg-muted/50" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-semester-trigger">الفصل الدراسي الحالي</Label>
                                            <Select
                                                value={formData.currentSemester || ''}
                                                onValueChange={(value) => handleInputChange('currentSemester', value)}
                                            >
                                                <SelectTrigger id="current-semester-trigger" className="rounded-xl h-11 border-muted-foreground/20 font-medium" aria-label="اختر الفصل الدراسي الحالي">
                                                    <SelectValue placeholder="اختر الفصل" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="الخريف">الخريف</SelectItem>
                                                    <SelectItem value="الربيع">الربيع</SelectItem>
                                                    <SelectItem value="الصيف">الصيف</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="academic-year">السنة الأكاديمية</Label>
                                            <Input 
                                                id="academic-year"
                                                value={formData.academicYear || ''} 
                                                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                                                className="rounded-xl h-11 border-muted-foreground/20 font-medium"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'appearance' && (
                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden" role="region" aria-labelledby="appearance-settings-title">
                                <CardHeader>
                                    <CardTitle id="appearance-settings-title" className="text-xl">تخصيص المظهر</CardTitle>
                                    <CardDescription className="font-medium">تحكم في الألوان والوضع الداكن لتناسب تفضيلاتك</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-base font-bold">نمط العرض</Label>
                                        <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="اختر نمط العرض">
                                            {[
                                                { id: 'light', label: 'فاتح', icon: Sun },
                                                { id: 'dark', label: 'داكن', icon: Moon },
                                                { id: 'system', label: 'تلقائي', icon: Monitor },
                                            ].map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setTheme(mode.id as any)}
                                                    role="radio"
                                                    aria-checked={theme === mode.id}
                                                    aria-label={`نمط عرض ${mode.label}`}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                        theme === mode.id 
                                                            ? "border-primary bg-primary/5 shadow-inner" 
                                                            : "border-transparent bg-muted/30 hover:bg-muted/50"
                                                    )}
                                                >
                                                    <mode.icon className={cn(
                                                        "h-6 w-6",
                                                        theme === mode.id ? "text-primary" : "text-muted-foreground"
                                                    )} aria-hidden="true" />
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        theme === mode.id ? "text-primary" : "text-muted-foreground"
                                                    )}>{mode.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-bold">اللون الأساسي للنظام</Label>
                                            <span className="text-xs text-muted-foreground font-medium">سيتم تطبيق التغيير فوراً</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-2xl" role="radiogroup" aria-label="اختر اللون الأساسي للنظام">
                                            {[
                                                { name: 'Emerald', color: '142.1 76.2% 36.3%', hex: '#10b981' },
                                                { name: 'Blue', color: '221.2 83.2% 53.3%', hex: '#3b82f6' },
                                                { name: 'Violet', color: '262.1 83.3% 57.8%', hex: '#8b5cf6' },
                                                { name: 'Rose', color: '346.8 77.2% 49.8%', hex: '#e11d48' },
                                                { name: 'Orange', color: '24.6 95% 53.1%', hex: '#f97316' },
                                            ].map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => setPrimaryColor(c.color)}
                                                    role="radio"
                                                    aria-checked={primaryColor === c.color}
                                                    aria-label={`اللون ${c.name}`}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full transition-all hover:scale-125 border-4",
                                                        primaryColor === c.color ? "border-foreground shadow-lg" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: c.hex }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'notifications' && (
                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-xl">تفضيلات التنبيهات</CardTitle>
                                    <CardDescription>اختر كيف ومتى ترغب في تلقي التحديثات من النظام</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-muted-foreground px-2 mb-2">قنوات التنبيه</h3>
                                        {[
                                            { id: 'systemNotifications', label: 'تنبيهات النظام', icon: Bell, color: 'text-primary' },
                                            { id: 'emailNotifications', label: 'إشعارات البريد الإلكتروني', icon: Globe, color: 'text-blue-500' },
                                            { id: 'pushNotifications', label: 'إشعارات المتصفح (Push)', icon: Cloud, color: 'text-orange-500' },
                                        ].map((toggle) => (
                                            <div key={toggle.id} className="flex items-center justify-between p-4 mb-2 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-xl bg-background", toggle.color)}>
                                                        <toggle.icon className="h-5 w-5" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{toggle.label}</p>
                                                        <p className="text-xs text-muted-foreground">{helpTexts[toggle.id]}</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={!!settings?.[toggle.id as keyof SystemSettings]} 
                                                    onCheckedChange={() => handleToggle(toggle.id as keyof SystemSettings)}
                                                    aria-label={toggle.label}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-6" />

                                    <div>
                                        <h3 className="text-sm font-bold text-muted-foreground px-2 mb-2">أنواع التنبيهات</h3>
                                        {[
                                            { id: 'academicNotifications', label: 'التنبيهات الأكاديمية', icon: Languages, color: 'text-emerald-500' },
                                            { id: 'financialNotifications', label: 'التنبيهات المالية', icon: Database, color: 'text-amber-500' },
                                            { id: 'administrativeNotifications', label: 'التنبيهات الإدارية', icon: ShieldAlert, color: 'text-indigo-500' },
                                        ].map((toggle) => (
                                            <div key={toggle.id} className="flex items-center justify-between p-4 mb-2 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-xl bg-background", toggle.color)}>
                                                        <toggle.icon className="h-5 w-5" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{toggle.label}</p>
                                                        <p className="text-xs text-muted-foreground">{helpTexts[toggle.id]}</p>
                                                    </div>
                                                </div>
                                                <Switch 
                                                    checked={!!settings?.[toggle.id as keyof SystemSettings]} 
                                                    onCheckedChange={() => handleToggle(toggle.id as keyof SystemSettings)}
                                                    aria-label={toggle.label}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'system' && (
                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-xl">إدارة حالة النظام</CardTitle>
                                    <CardDescription>تفعيل وتعطيل الوظائف الأساسية للمستخدمين</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { id: 'registrationEnabled', label: 'تسجيل الطلاب الذاتي', icon: User, color: 'text-primary' },
                                        { id: 'gradingEnabled', label: 'نظام رصد الدرجات', icon: Calendar, color: 'text-primary' },
                                        { id: 'systemMaintenance', label: 'وضع الصيانة العام', icon: ShieldAlert, color: 'text-destructive' },
                                    ].map((toggle) => (
                                        <div key={toggle.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("p-2 rounded-xl bg-background", toggle.color)}>
                                                    <toggle.icon className="h-5 w-5" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">{toggle.label}</p>
                                                    <p className="text-xs text-muted-foreground">{helpTexts[toggle.id]}</p>
                                                </div>
                                            </div>
                                            <Switch 
                                                checked={!!settings?.[toggle.id as keyof SystemSettings]} 
                                                onCheckedChange={() => handleToggle(toggle.id as keyof SystemSettings)}
                                                aria-label={toggle.label}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary">
                            <HelpCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm">
                                <strong>نصيحة:</strong> يتم حفظ بعض الإعدادات تلقائياً، ولكن يفضل الضغط على زر الحفظ للتأكد من مزامنة كافة التغييرات مع حسابك.
                            </p>
                        </div>
                    </div>
                </div>
        </div>
    )
}

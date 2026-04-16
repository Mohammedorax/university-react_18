import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'
import { ArrowRight, FileText, FolderTree, Code, Palette, Shield, Database, Globe, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * @page ProjectStructurePage
 * @description صفحة عرض هيكيلة المشروع - تعرض التوثيق التقني والهيكلية
 */
export default function ProjectStructurePage() {
    const navigate = useNavigate()

    const sections = [
        {
            icon: FolderTree,
            title: 'هيكلية المجلدات',
            description: 'معمارية قائمة على الميزات مع فصل واضح للمسؤوليات',
            color: 'from-violet-500 to-indigo-500',
        },
        {
            icon: Code,
            title: 'التقنيات المستخدمة',
            description: 'React 18, TypeScript, Vite 6, Tailwind CSS, Radix UI',
            color: 'from-cyan-500 to-teal-500',
        },
        {
            icon: Palette,
            title: 'الهوية البصرية',
            description: 'ألوان متدرجة متوافقة مع الوضع الفاتح والداكن',
            color: 'from-emerald-500 to-green-500',
        },
        {
            icon: Shield,
            title: 'الأمان',
            description: 'تطهير المدخلات، التحقق من الصحة، حماية XSS',
            color: 'from-amber-500 to-orange-500',
        },
        {
            icon: Database,
            title: 'إدارة الحالة',
            description: 'Redux Toolkit للحالة العامة، React Query لبيانات الخادم',
            color: 'from-rose-500 to-pink-500',
        },
        {
            icon: Globe,
            title: 'تعدد اللغات',
            description: 'i18next مع دعم العربية والإنجليزية',
            color: 'from-blue-500 to-indigo-500',
        },
    ]

    const documentationSections = [
        {
            id: 'overview',
            title: 'نظرة عامة على المشروع',
            description: 'ملخص معماري ووظيفي سريع عن النظام والمنصة والتقنيات الأساسية.',
            icon: <FileText className="h-5 w-5" aria-hidden="true" />,
            defaultOpen: true,
            content: (
                <p className="text-muted-foreground leading-relaxed">
                    نظام إدارة جامعة العرب هو تطبيق ويب تفاعلي مبني بـ React 18 و TypeScript و Vite 6،
                    مصمم لإدارة العمليات الأكاديمية والإدارية في المؤسسات التعليمية. يدعم النظام
                    اللغة العربية كلغة أساسية مع دعم اللغة الإنجليزية، ويوفر واجهة مستخدم متجاوبة
                    تعمل في الوضع الفاتح والداكن مع بنية قائمة على الميزات لتسهيل التطوير والتوسع.
                </p>
            ),
        },
        {
            id: 'modules',
            title: 'الوحدات الرئيسية',
            description: 'عرض مختصر للوحدات الأساسية داخل النظام مع نص كامل ظاهر عند الفتح.',
            icon: <FolderTree className="h-5 w-5" aria-hidden="true" />,
            content: (
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-500" />
                        إدارة الطلاب - إضافة، تعديل، حذف، وعرض بيانات الطلاب
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-500" />
                        إدارة المعلمين - إدارة بيانات المعلمين والمقررات الدراسية
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        إدارة الموظفين - إدارة الموظفين الإداريين
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        المقررات الدراسية - إدارة المقررات والتسجيل
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        الدرجات - إدارة الدرجات والتقديرات
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        الخصومات والمنح - إدارة الخصومات المالية والمنح الدراسية
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        المخزون - إدارة المخزون والأصول
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-pink-500" />
                        التقارير - إنشاء وعرض التقارير
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                        الحضور والغياب - رصد الحضور للمعلمين
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        سجل التدقيق - مراقبة الأنشطة في النظام
                    </li>
                </ul>
            ),
        },
        {
            id: 'best-practices',
            title: 'أفضل الممارسات',
            description: 'ممارسات التطوير والتصميم المعتمدة داخل المشروع.',
            icon: <Shield className="h-5 w-5" aria-hidden="true" />,
            content: (
                <ul className="space-y-2 text-muted-foreground">
                    <li>✅ استخدام معمارية الميزات (Feature-based Architecture)</li>
                    <li>✅ فصل المسؤوليات بين المنطق والواجهة</li>
                    <li>✅ استخدام TypeScript للتحقق من الأنواع</li>
                    <li>✅ استخدام React Hook Form + Zod للتحقق من النماذج</li>
                    <li>✅ استخدام React Query لبيانات الخادم</li>
                    <li>✅ استخدام Redux Toolkit للحالة العامة</li>
                    <li>✅ دعم RTL كامل للغة العربية</li>
                    <li>✅ ألوان متوافقة مع الوضع الفاتح والداكن</li>
                    <li>✅ تطهير جميع المدخلات عبر DOMPurify</li>
                    <li>✅ استخدام العرض الافتراضي للجداول الكبيرة</li>
                </ul>
            ),
        },
    ]

    return (
        <div className="container mx-auto py-8 space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">هيكيلة المشروع</h1>
                        <p className="text-muted-foreground">التوثيق التقني الشامل لنظام إدارة جامعة العرب</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="gap-2">
                    <span>العودة للوحة التحكم</span>
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Main Documentation Card */}
            <Card className="border-none shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        التوثيق التقني
                    </CardTitle>
                    <CardDescription>
                        دليل شامل للمطورين يغطي جميع جوانب المشروع
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {sections.map((section, index) => (
                            <Card key={index} className="border hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                                        <section.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold mb-1">{section.title}</h3>
                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Documentation Content */}
                    <div className="space-y-4">
                        {documentationSections.map((section) => (
                            <Collapsible
                                key={section.id}
                                title={section.title}
                                description={section.description}
                                defaultOpen={section.defaultOpen}
                                icon={section.icon}
                                className="border bg-muted/30 shadow-sm"
                                triggerClassName="rounded-b-none text-right"
                                contentClassName="bg-background/60"
                            >
                                {section.content}
                            </Collapsible>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

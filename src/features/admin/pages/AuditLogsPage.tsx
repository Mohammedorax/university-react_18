import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api as mockApi } from '@/services/api';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { ArrowRight, History, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function AuditLogsPage() {
    const navigate = useNavigate();

    const { data: logs = [], isLoading, error } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => mockApi.getAuditLogs(),
    });

    if (error) {
        return (
            <div className="container mx-auto py-8 space-y-6" dir="rtl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-destructive">خطأ في تحميل البيانات</h1>
                        <p className="text-muted-foreground">فشل تحميل سجل التدقيق. يرجى المحاولة مرة أخرى.</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
                    <span>العودة للوحة التحكم</span>
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    const columns = [
        {
            key: 'timestamp',
            title: 'الوقت',
            render: (value: unknown) => {
                const date = new Date(value as string);
                return isNaN(date.getTime()) ? '—' : format(date, 'PPP p', { locale: ar });
            },
        },
        {
            key: 'userId',
            title: 'المستخدم',
            render: (value: unknown) => (
                <div className="font-medium">{value as string}</div>
            ),
        },
        {
            key: 'action',
            title: 'الإجراء',
            render: (value: unknown) => {
                const val = value as string;
                const isDelete = val.toLowerCase().includes('delete') || val.toLowerCase().includes('حذف');
                const isUpdate = val.toLowerCase().includes('update') || val.toLowerCase().includes('تعديل');
                return (
                    <Badge variant={isDelete ? 'destructive' : isUpdate ? 'outline' : 'default'}>
                        {val}
                    </Badge>
                );
            },
        },
        {
            key: 'details',
            title: 'التفاصيل',
            render: (value: unknown) => (
                <div className="max-w-[300px] truncate text-muted-foreground" title={value as string}>
                    {value as string}
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto py-8 space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <History className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">سجل الأنشطة</h1>
                        <p className="text-muted-foreground">عرض ومراقبة كافة العمليات التي تمت في النظام</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
                    <span>العودة للوحة التحكم</span>
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-6">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-semibold">قائمة العمليات الأخيرة</h2>
                    </div>

                    <DataTable
                        data={logs}
                        columns={columns}
                        isLoading={isLoading}
                        searchPlaceholder="البحث في العمليات..."
                        emptyMessage="لا يوجد سجلات متاحة حالياً"
                    />
                </div>
            </div>
        </div>
    );
}

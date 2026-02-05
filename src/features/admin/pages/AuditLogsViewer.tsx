import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SearchX } from 'lucide-react';
import { logger } from '@/lib/logger';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user_id: string;
}

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<{ action?: string; userId?: string }>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const stored = localStorage.getItem('audit_logs');
        if (stored) {
          const parsed = JSON.parse(stored) as AuditLog[];
          setLogs(parsed);
        }
      } catch (error) {
        logger.error('Failed to load audit logs', { error: error instanceof Error ? error.message : String(error) });
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesAction = !filter.action || log.action.toLowerCase().includes(filter.action.toLowerCase());
    const matchesUser = !filter.userId || log.user_id.includes(filter.userId);
    return matchesAction && matchesUser;
  });

  const searchedLogs = logs.filter(log => {
    const searchTerm = search.toLowerCase();
    return log.action.toLowerCase().includes(searchTerm) ||
           log.details.toLowerCase().includes(searchTerm) ||
           log.user_id.toLowerCase().includes(searchTerm);
  });

  const displayedLogs = [...searchedLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      try {
        const updated = logs.filter(log => log.id !== id);
        setLogs(updated);
        localStorage.setItem('audit_logs', JSON.stringify(updated));
        logger.info('Audit log deleted', { logId: id });
      } catch (error) {
        logger.error('Failed to delete audit log', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  };

  const handleExport = () => {
    const data = displayedLogs.map(log => ({
      action: log.action,
      details: log.details,
      userId: log.user_id,
      date: new Date(log.timestamp).toLocaleString('ar-SA'),
    }));

    const headers = ['action', 'details', 'userId', 'date'];
    const rows = data.map(obj => Object.values(obj).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('Audit logs exported', { count: displayedLogs.length });
  };

  const actionColors = {
    Login: 'bg-green-100',
    Logout: 'bg-yellow-100',
    CREATE: 'bg-blue-100',
    UPDATE: 'bg-purple-100',
    DELETE: 'bg-red-100',
    ERROR: 'bg-red-500',
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="rounded-lg border shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">سجل النشاطات</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              تصدير CSV
            </Button>
            <Button variant="outline" onClick={() => setLogs([])}>
              مسح السجلات
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في السجلات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="border rounded-md px-3 py-2"
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            >
              <option value="">كل الإجراءات</option>
              <option value="Login">تسجيل الدخول</option>
              <option value="Logout">تسجيل الخروج</option>
              <option value="CREATE">إنشاء</option>
              <option value="UPDATE">تعديل</option>
              <option value="DELETE">حذف</option>
              <option value="ERROR">خطأ</option>
            </select>

            <select
              className="border rounded-md px-3 py-2"
              value={filter.userId}
              onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
            >
              <option value="">كل المستخدمين</option>
            </select>

            <button
              type="button"
              onClick={() => setSearch('')}
              className="p-2 rounded-md border hover:bg-muted"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد سجلات</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px] border rounded-lg">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-right border-b bg-muted p-2">التاريخ والوقت</th>
                  <th className="text-right border-b bg-muted p-2">المستخدم</th>
                  <th className="text-right border-b bg-muted p-2">الإجراء</th>
                  <th className="border-b bg-muted p-2">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {displayedLogs.slice(0, 50).map((log) => (
                  <tr key={log.id}>
                    <td className="text-sm p-2 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </td>
                    <td className="text-sm p-2 whitespace-nowrap">
                      {log.user_id}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${actionColors[log.action as keyof typeof actionColors] || 'bg-gray-100'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-sm p-2 max-w-[400px] truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length > 50 && (
              <div className="flex justify-center py-4">
                <p className="text-sm text-muted-foreground">
                  عرض أول 50 من {logs.length} سجل
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

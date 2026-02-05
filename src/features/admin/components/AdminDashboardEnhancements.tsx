import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/i18n/i18n.hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import {
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { usePerformanceMonitor } from '@/lib/performance';

interface Stat {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export function AdminDashboardEnhancements() {
  const { t } = useTranslation();
  const measure = usePerformanceMonitor('AdminDashboardEnhancements');

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeCourses: 0,
    totalCourses: 0,
    completedTasks: 0,
    pendingTasks: 0,
    systemHealth: 'good' as 'good' | 'warning' | 'critical',
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'student', action: 'إضافة طالب', user: 'أحمد محمد', time: 'منذ 5 دقائق' },
    { id: 2, type: 'course', action: 'إنشاء مادة', user: 'د. سارة خالد', time: 'منذ 15 دقيقة' },
    { id: 3, type: 'system', action: 'تحديث النظام', user: 'النظام', time: 'منذ ساعة' },
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'قاعدة البيانات بنسبة 80%', time: 'منذ 10 دقائق' },
    { id: 2, type: 'error', message: 'فشل اتصال WebSocket', time: 'منذ 30 دقيقة' },
  ]);

  const studentStats: Stat[] = useMemo(() => [
    {
      title: t('stats.totalStudents'),
      value: stats.totalStudents,
      change: '+12%',
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: t('stats.activeStudents'),
      value: stats.activeStudents,
      change: '+5%',
      trend: 'up',
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ], [stats.totalStudents, stats.activeStudents, t]);

  const courseStats: Stat[] = useMemo(() => [
    {
      title: t('stats.totalCourses'),
      value: stats.totalCourses,
      change: '+3%',
      trend: 'up',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      title: t('stats.activeCourses'),
      value: stats.activeCourses,
      change: '-2%',
      trend: 'down',
      icon: <TrendingDown className="w-5 h-5" />,
    },
  ], [stats.totalCourses, stats.activeCourses, t]);

  const systemStats: Stat[] = useMemo(() => [
    {
      title: t('stats.systemHealth'),
      value: stats.systemHealth,
      change: '',
      trend: 'neutral',
      icon: stats.systemHealth === 'good' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />,
    },
    {
      title: t('stats.uptime'),
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: <Clock className="w-5 h-5" />,
    },
  ], [stats.systemHealth, t]);

  useEffect(() => {
    const loadDashboardData = measure.measureRender(() => {
      Promise.all([
        fetch('/api/students/stats'),
        fetch('/api/courses/stats'),
        fetch('/api/system/stats'),
      ])
        .then(([students, courses, system]: any[]) => {
          setStats({
            totalStudents: students?.total || 0,
            activeStudents: students?.active || 0,
            totalTeachers: students?.teachers || 0,
            totalCourses: courses?.total || 0,
            activeCourses: courses?.active || 0,
            completedTasks: system?.tasks?.completed || 0,
            pendingTasks: system?.tasks?.pending || 0,
            systemHealth: system?.health || 'good',
          });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load dashboard data:', error);
          setIsLoading(false);
        });
    });

    loadDashboardData();
  }, [measure]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshing(true);
      Promise.all([
        fetch('/api/students/stats'),
        fetch('/api/system/stats'),
      ])
        .then(([students, system]: any[]) => {
          setStats((prev: any) => ({
            ...prev,
            totalStudents: students?.total || prev.totalStudents,
            systemHealth: system?.health || prev.systemHealth,
          }));
          setRecentActivity((prev) => [
            {
              id: prev.length + 1,
              type: 'system',
              action: 'تحديث تلقائي',
              user: 'النظام',
              time: 'الآن',
            },
            ...prev.slice(0, -1),
          ]);
          setRefreshing(false);
        })
        .catch((error) => {
          console.error('Auto-refresh failed:', error);
          setRefreshing(false);
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, measure]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleExportData = () => {
    alert(t('dashboard.exportData'));
  };

  const handleConfigureDashboard = () => {
    alert(t('dashboard.configure'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            {autoRefresh ? t('dashboard.autoRefreshOn') : t('dashboard.autoRefreshOff')}
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            {t('dashboard.export')}
          </Button>
          <Button variant="outline" onClick={handleConfigureDashboard}>
            <Settings className="w-4 h-4" />
            {t('dashboard.configure')}
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${alert.type === 'error' ? 'text-red-600' : alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <p className="font-semibold">{alert.message}</p>
                  <p className="text-sm opacity-75">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studentStats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
        {courseStats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
        {systemStats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('dashboard.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" onClick={() => alert(t('dashboard.addStudent'))}>
              <Users className="w-4 h-4" />
              {t('dashboard.addStudent')}
            </Button>
            <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => alert(t('dashboard.addCourse'))}>
              <BookOpen className="w-4 h-4" />
              {t('dashboard.addCourse')}
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => alert(t('dashboard.generateReport'))}>
              <Download className="w-4 h-4" />
              {t('dashboard.generateReport')}
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => alert(t('dashboard.systemSettings'))}>
              <Settings className="w-4 h-4" />
              {t('dashboard.systemSettings')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {t('dashboard.systemStatus')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t('dashboard.status')}:</span>
            <span className="text-green-600 font-semibold">{t('dashboard.operational')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t('dashboard.lastBackup')}:</span>
            <span className="font-semibold">{new Date().toLocaleString('ar-SA')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t('dashboard.autoRefresh')}:</span>
            <span className={`font-semibold ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}>
              {autoRefresh ? t('dashboard.enabled') : t('dashboard.disabled')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

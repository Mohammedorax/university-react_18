/**
 * @file ErrorHandlingExample.tsx
 * @description Example component showing comprehensive error handling
 */

import { useState } from 'react';
import { useErrorHandler, AppError } from '@/lib/error-handling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/features/students/types';

export function ErrorHandlingExample() {
  const { handleError, showSuccess, showInfo, showWarning } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  // Example 1: Basic error handling with try-catch
  const handleFetchStudents = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with mock data
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@test.com',
          university_id: '2024001',
          department: 'علوم الحاسب',
          year: 3,
          gpa: 3.5,
          enrolled_courses: ['c1', 'c2'],
          avatar: ''
        },
        {
          id: '2',
          name: 'سارة أحمد',
          email: 'sara@test.com',
          university_id: '2024002',
          department: 'هندسة البرمجيات',
          year: 2,
          gpa: 3.8,
          enrolled_courses: ['c3'],
          avatar: ''
        }
      ];
      
      setStudents(mockStudents);
      showSuccess('تم تحميل البيانات بنجاح', `تم العثور على ${mockStudents.length} طالب`);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example 2: Error with retry action
  const handleDeleteWithRetry = async (studentId: string) => {
    try {
      // Simulate delete operation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 50% chance of failure for demo
          if (Math.random() > 0.5) {
            reject(new Error('Network error'));
          } else {
            resolve(true);
          }
        }, 500);
      });
      
      showSuccess('تم حذف الطالب بنجاح');
      // Remove from list
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
      // Create error with retry action
      const appError = new AppError(
        'فشل حذف الطالب',
        'high',
        'قد تكون هناك مشكلة في الاتصال بالخادم',
        {
          label: 'إعادة المحاولة',
          onClick: () => handleDeleteWithRetry(studentId),
        },
        8000
      );
      handleError(appError);
    }
  };

  // Example 3: Validation error
  const handleValidationExample = () => {
    try {
      const email = 'invalid-email';
      if (!email.includes('@')) {
        throw new AppError(
          'بريد إلكتروني غير صالح',
          'medium',
          'يرجى إدخال بريد إلكتروني صحيح (مثال: user@example.com)'
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Example 4: Network error with different severity levels
  const handleNetworkErrorExample = () => {
    // Low severity - just a warning
    showWarning('الاتصال ضعيف', 'قد يستغرق التحميل وقتاً أطول');

    // Medium severity - user error
    setTimeout(() => {
      const userError = new AppError(
        'لا يوجد طلاب مسجلين',
        'medium',
        'يمكنك إضافة طلاب جدد من خلال الضغط على زر "إضافة طالب"'
      );
      handleError(userError);
    }, 1000);

    // High severity - system error with retry
    setTimeout(() => {
      const systemError = new AppError(
        'فشل الاتصال بالخادم',
        'high',
        'يرجى التحقق من اتصالك بالإنترنت',
        {
          label: 'إعادة الاتصال',
          onClick: () => window.location.reload(),
        }
      );
      handleError(systemError);
    }, 2000);
  };

  // Example 5: Async operation with proper cleanup
  const handleAsyncWithCleanup = async () => {
    const controller = new AbortController();
    
    try {
      showInfo('جاري المعالجة...', 'سيتم إعلامك عند الانتهاء');
      
      // Simulate API call
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (controller.signal.aborted) {
            reject(new Error('Operation cancelled'));
          } else {
            resolve(true);
          }
        }, 2000);

        controller.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Operation cancelled'));
        });
      });

      showSuccess('تمت العملية بنجاح!');
    } catch (error) {
      if (error instanceof Error && error.message === 'Operation cancelled') {
        showWarning('تم إلغاء العملية');
      } else {
        handleError(error);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>أمثلة على معالجة الأخطاء</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">1. العملية الأساسية (مع تحميل)</h3>
          <Button 
            onClick={handleFetchStudents} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'جاري التحميل...' : 'تحميل الطلاب'}
          </Button>
          {students.length > 0 && (
            <p className="text-sm text-muted-foreground">
              تم تحميل {students.length} طالب
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">2. خطأ مع إعادة المحاولة</h3>
          <Button 
            onClick={() => handleDeleteWithRetry('1')} 
            variant="destructive"
            className="w-full"
          >
            محاولة الحذف (مع خطأ)
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">3. خطأ التحقق من الصحة</h3>
          <Button 
            onClick={handleValidationExample} 
            variant="outline"
            className="w-full"
          >
            عرض خطأ التحقق
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">4. مستويات مختلفة من الخطورة</h3>
          <Button 
            onClick={handleNetworkErrorExample} 
            variant="secondary"
            className="w-full"
          >
            عرض مستويات الخطأ
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">5. عملية غير متزامنة مع إلغاء</h3>
          <Button 
            onClick={handleAsyncWithCleanup} 
            variant="outline"
            className="w-full"
          >
            بدء عملية طويلة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

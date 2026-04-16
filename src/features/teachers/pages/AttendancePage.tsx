import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as mockApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Save, UserCheck, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AttendanceRecord {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late';
}

export default function AttendancePage() {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch courses (ideally filtered by the logged-in teacher)
    const { data: coursesData } = useQuery({
        queryKey: ['courses', { limit: 100 }],
        queryFn: () => mockApi.getCourses({ limit: 100 }),
    });

    const courses = coursesData?.items || [];

    // Fetch students for the selected course
    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ['course-students', selectedCourseId],
        queryFn: async () => {
            if (!selectedCourseId) return [];
            // In a real app, we'd have a specific endpoint for course students
            // Here we filter all students by those enrolled in this course
            const allStudentsResult = await mockApi.getStudents({ limit: 1000 });
            return allStudentsResult.items.filter(s => s.enrolled_courses.includes(selectedCourseId));
        },
        enabled: !!selectedCourseId,
    });

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.university_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
        const newAttendance = { ...attendance };
        filteredStudents.forEach(s => {
            newAttendance[s.id] = status;
        });
        setAttendance(newAttendance);
    };

    const submitMutation = useMutation({
        mutationFn: async () => {
            // Persist attendance data to localStorage for mock persistence
            const attendanceRecords: AttendanceRecord[] = filteredStudents.map(student => ({
                studentId: student.id,
                studentName: student.name,
                status: attendance[student.id],
            }));
            const existingRecords = JSON.parse(localStorage.getItem('attendance_records') || '[]');
            // Remove old records for this course and add new ones
            const filteredRecords = existingRecords.filter(
                (r: AttendanceRecord) => r.studentId && !attendanceRecords.some(a => a.studentId === r.studentId)
            );
            // Cap records to prevent localStorage overflow (keep last 500)
            const updatedRecords = [...filteredRecords, ...attendanceRecords].slice(-500);
            localStorage.setItem('attendance_records', JSON.stringify(updatedRecords));
            localStorage.setItem(`attendance_${selectedCourseId}_${new Date().toISOString().split('T')[0]}`, JSON.stringify(attendance));

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true };
        },
        onSuccess: () => {
            toast.success('تم حفظ سجل الحضور بنجاح');
            // Invalidate course-students query to refresh if needed
            queryClient.invalidateQueries({ queryKey: ['course-students', selectedCourseId] });
        },
    });

    const handleSubmit = () => {
        if (Object.keys(attendance).length < filteredStudents.length) {
            toast.warning('يرجى رصد الحضور لجميع الطلاب قبل الحفظ');
            return;
        }
        submitMutation.mutate();
    };

    return (
        <div className="container mx-auto py-8 space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">تحضير الطلاب</h1>
                        <p className="text-muted-foreground">رصد الحضور والغياب اليومي للمساقات</p>
                    </div>
                </div>
            </div>

            <Card className="rounded-2xl border-none shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <CardTitle>اختر المساق</CardTitle>
                            <CardDescription>حدد المساق الذي ترغب في رصد الحضور له</CardDescription>
                        </div>
                        <div className="w-full md:w-72">
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue placeholder="اختر المساق..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.name} ({course.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {selectedCourseId && (
                <Card className="rounded-2xl border-none shadow-lg">
                    <CardHeader className="border-b">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="بحث عن طالب..."
                                        className="pr-10 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="text-sm font-medium flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{filteredStudents.length} طالب</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')} className="rounded-lg h-10 border-emerald-200 hover:bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 className="ml-2 w-4 h-4" />
                                    حاضر للكل
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')} className="rounded-lg h-10 border-rose-200 hover:bg-rose-50 text-rose-600">
                                    <XCircle className="ml-2 w-4 h-4" />
                                    غائب للكل
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {studentsLoading ? (
                            <div className="p-12 text-center text-muted-foreground">جاري تحميل قائمة الطلاب...</div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">لا يوجد طلاب مسجلين في هذا المساق</div>
                        ) : (
                            <div className="divide-y">
                                {filteredStudents.map(student => (
                                    <div key={student.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {student.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold">{student.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{student.university_id}</div>
                                            </div>
                                        </div>

                                        <RadioGroup
                                            value={attendance[student.id]}
                                            onValueChange={(val) => handleStatusChange(student.id, val as any)}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="flex items-center space-x-reverse space-x-2">
                                                <RadioGroupItem value="present" id={`${student.id}-present`} className="text-emerald-500 border-emerald-500" />
                                                <Label htmlFor={`${student.id}-present`} className="cursor-pointer">حاضر</Label>
                                            </div>
                                            <div className="flex items-center space-x-reverse space-x-2">
                                                <RadioGroupItem value="absent" id={`${student.id}-absent`} className="text-rose-500 border-rose-500" />
                                                <Label htmlFor={`${student.id}-absent`} className="cursor-pointer">غائب</Label>
                                            </div>
                                            <div className="flex items-center space-x-reverse space-x-2">
                                                <RadioGroupItem value="late" id={`${student.id}-late`} className="text-amber-500 border-amber-500" />
                                                <Label htmlFor={`${student.id}-late`} className="cursor-pointer">متأخر</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-6 border-t bg-muted/20 flex justify-end">
                        <Button
                            size="lg"
                            className="rounded-xl px-8 font-bold gap-2 shadow-lg"
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending || filteredStudents.length === 0}
                        >
                            <Save className="w-5 h-5" />
                            حفظ سجل الحضور
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}

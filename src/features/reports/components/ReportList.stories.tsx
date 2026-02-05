import type { Meta, StoryObj } from '@storybook/react';
import { ReportList } from './ReportList';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof ReportList> = {
  title: 'Features/Reports/ReportList',
  component: ReportList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div dir="rtl" className="font-cairo">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    icon: {
      control: 'select',
      options: ['file', 'chart', 'calendar', 'filter', 'book'],
    },
    pageSize: { control: 'number' },
    isEmpty: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ReportList>;

const studentColumns = [
  {
    key: 'name',
    title: 'الاسم',
    sortable: true,
  },
  {
    key: 'department',
    title: 'القسم',
    render: (value: string) => (
      <Badge variant="outline">{value}</Badge>
    ),
  },
  {
    key: 'gpa',
    title: 'المعدل',
    sortable: true,
    render: (value: number) => (
      <span className={value >= 3.5 ? 'text-emerald-600 font-bold' : value < 2.5 ? 'text-destructive font-bold' : ''}>
        {value.toFixed(2)}
      </span>
    ),
  },
];

const studentData = [
  { id: '1', name: 'أحمد محمد', department: 'علوم الحاسب', gpa: 3.75 },
  { id: '2', name: 'سارة أحمد', department: 'هندسة البرمجيات', gpa: 3.85 },
  { id: '3', name: 'محمد علي', department: 'نظم المعلومات', gpa: 2.90 },
  { id: '4', name: 'ليلى خالد', department: 'علوم الحاسب', gpa: 3.60 },
  { id: '5', name: 'عمر يوسف', department: 'الذكاء الاصطناعي', gpa: 3.20 },
  { id: '6', name: 'نورا سامي', department: 'هندسة البرمجيات', gpa: 3.95 },
  { id: '7', name: 'خالد عبدالله', department: 'علوم الحاسب', gpa: 2.40 },
  { id: '8', name: 'فاطمة حسن', department: 'نظم المعلومات', gpa: 3.45 },
];

const courseColumns = [
  {
    key: 'courseName',
    title: 'المقرر',
    sortable: true,
  },
  {
    key: 'instructor',
    title: 'المدرس',
  },
  {
    key: 'students',
    title: 'عدد الطلاب',
    sortable: true,
  },
];

const courseData = [
  { id: '1', courseName: 'برمجة 1', instructor: 'د. أحمد', students: 120 },
  { id: '2', courseName: 'قواعد البيانات', instructor: 'د. سارة', students: 95 },
  { id: '3', courseName: 'الذكاء الاصطناعي', instructor: 'د. محمد', students: 80 },
  { id: '4', courseName: 'شبكات الحاسب', instructor: 'د. ليلى', students: 75 },
];

export const Default: Story = {
  args: {
    title: 'قائمة الطلاب',
    description: 'عرض جميع الطلاب المسجلين في النظام',
    icon: 'file',
    data: studentData,
    columns: studentColumns,
    pageSize: 5,
    searchPlaceholder: 'بحث في الطلاب...',
    isEmpty: false,
  },
};

export const WithBookIcon: Story = {
  args: {
    title: 'المقررات الدراسية',
    description: 'قائمة المقررات المتاحة للفصل الدراسي',
    icon: 'book',
    data: courseData,
    columns: courseColumns,
    pageSize: 5,
    searchPlaceholder: 'بحث في المقررات...',
    isEmpty: false,
  },
};

export const WithChartIcon: Story = {
  args: {
    title: 'إحصائيات الأداء',
    description: 'تحليل أداء الطلاب في مختلف المقررات',
    icon: 'chart',
    data: studentData,
    columns: studentColumns,
    pageSize: 5,
    searchPlaceholder: 'بحث...',
    isEmpty: false,
  },
};

export const EmptyStudents: Story = {
  args: {
    title: 'قائمة الطلاب',
    description: 'لا يوجد طلاب مسجلين حالياً',
    icon: 'file',
    data: [],
    columns: studentColumns,
    pageSize: 5,
    isEmpty: true,
    emptyState: {
      icon: 'user',
      title: 'لا يوجد طلاب',
      description: 'لم يتم تسجيل أي طلاب في النظام حتى الآن',
    },
  },
};

export const EmptyCourses: Story = {
  args: {
    title: 'المقررات الدراسية',
    description: 'لا توجد مقررات متاحة',
    icon: 'book',
    data: [],
    columns: courseColumns,
    pageSize: 5,
    isEmpty: true,
    emptyState: {
      icon: 'book',
      title: 'لا توجد مقررات',
      description: 'لم يتم إضافة أي مقررات دراسية حتى الآن',
    },
  },
};

export const LargeDataset: Story = {
  args: {
    title: 'جميع الطلاب',
    description: 'قاعدة بيانات كاملة للطلاب',
    icon: 'filter',
    data: [
      ...studentData,
      ...studentData.map(s => ({ ...s, id: s.id + 'a', name: s.name + ' (2)' })),
      ...studentData.map(s => ({ ...s, id: s.id + 'b', name: s.name + ' (3)' })),
    ],
    columns: studentColumns,
    pageSize: 10,
    searchPlaceholder: 'البحث في جميع الطلاب...',
    isEmpty: false,
  },
};

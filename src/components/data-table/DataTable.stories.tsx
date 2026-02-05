import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable/DataTable',
  component: DataTable,
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
    isLoading: { control: 'boolean' },
    virtualized: { control: 'boolean' },
    pageSize: { control: 'number' },
    virtualHeight: { control: 'number' },
    searchPlaceholder: { control: 'text' },
    emptyMessage: { control: 'text' },
    caption: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleData = [
  { id: '1', name: 'أحمد علي', email: 'ahmed@example.com', department: 'علوم الحاسب', status: 'active', gpa: 3.75 },
  { id: '2', name: 'سارة محمود', email: 'sara@example.com', department: 'هندسة البرمجيات', status: 'active', gpa: 3.85 },
  { id: '3', name: 'محمد حسن', email: 'mohammed@example.com', department: 'نظم المعلومات', status: 'inactive', gpa: 2.90 },
  { id: '4', name: 'ليلى خالد', email: 'layla@example.com', department: 'علوم الحاسب', status: 'active', gpa: 3.60 },
  { id: '5', name: 'عمر يوسف', email: 'omar@example.com', department: 'الذكاء الاصطناعي', status: 'pending', gpa: 3.20 },
];

const columns = [
  {
    key: 'name',
    title: 'الاسم',
    sortable: true,
  },
  {
    key: 'email',
    title: 'البريد الإلكتروني',
  },
  {
    key: 'department',
    title: 'القسم',
    sortable: true,
    render: (value: string) => (
      <Badge variant="outline">{value}</Badge>
    ),
  },
  {
    key: 'status',
    title: 'الحالة',
    sortable: true,
    render: (value: string) => (
      <Badge 
        variant={value === 'active' ? 'default' : value === 'inactive' ? 'destructive' : 'secondary'}
      >
        {value === 'active' ? 'نشط' : value === 'inactive' ? 'غير نشط' : 'قيد الانتظار'}
      </Badge>
    ),
  },
  {
    key: 'gpa',
    title: 'المعدل',
    sortable: true,
    render: (value: number) => (
      <span className={value >= 3.5 ? 'text-emerald-600 font-bold' : ''}>
        {value.toFixed(2)}
      </span>
    ),
  },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns,
    searchPlaceholder: 'بحث في البيانات...',
    pageSize: 10,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns,
    isLoading: true,
    searchPlaceholder: 'بحث...',
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: 'لا توجد بيانات لعرضها',
  },
};

export const WithRowSelection: Story = {
  args: {
    data: sampleData,
    columns,
    onRowSelection: (items) => console.log('Selected:', items),
    searchPlaceholder: 'بحث مع اختيار متعدد...',
  },
};

export const WithRowActions: Story = {
  args: {
    data: sampleData,
    columns,
    rowActions: (item) => (
      <div className="flex flex-col gap-1 p-1">
        <button className="text-right px-2 py-1 hover:bg-muted rounded text-sm font-bold" onClick={() => alert(`تعديل ${item.name}`)}>تعديل</button>
        <button className="text-right px-2 py-1 hover:bg-muted rounded text-sm font-bold text-destructive" onClick={() => alert(`حذف ${item.name}`)}>حذف</button>
      </div>
    ),
  },
};

export const WithCustomRowActions: Story = {
  args: {
    data: sampleData,
    columns,
    customRowActions: (item) => (
      <button 
        className="text-primary font-bold hover:underline text-sm"
        onClick={() => alert(`عرض تفاصيل ${item.name}`)}
      >
        التفاصيل
      </button>
    ),
  },
};

export const WithBulkActions: Story = {
  args: {
    data: sampleData,
    columns,
    onRowSelection: (items) => console.log('Selected:', items),
    bulkActions: (selectedItems) => (
      <button 
        className="bg-destructive text-white px-4 py-2 rounded-xl font-bold text-sm"
        onClick={() => alert(`حذف ${selectedItems.length} عنصر`)}
      >
        حذف المحدد ({selectedItems.length})
      </button>
    ),
  },
};

export const ExternalPagination: Story = {
  args: {
    data: sampleData,
    columns,
    currentPage: 1,
    totalPages: 5,
    totalItems: 25,
    pageSize: 5,
    onPageChange: (page) => console.log('Page changed to:', page),
  },
};

export const Virtualized: Story = {
  args: {
    data: Array.from({ length: 100 }, (_, i) => ({
      id: String(i + 1),
      name: `طالب ${i + 1}`,
      email: `student${i + 1}@example.com`,
      department: ['علوم الحاسب', 'هندسة البرمجيات', 'نظم المعلومات'][i % 3],
      status: ['active', 'inactive', 'pending'][i % 3],
      gpa: (2.0 + Math.random() * 2.0),
    })),
    columns,
    virtualized: true,
    virtualHeight: 400,
    pageSize: 20,
  },
};

export const WithCaption: Story = {
  args: {
    data: sampleData,
    columns,
    caption: 'جدول الطلاب المسجلين في النظام',
    searchPlaceholder: 'بحث...',
  },
};

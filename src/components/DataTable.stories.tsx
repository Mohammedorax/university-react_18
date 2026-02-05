import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Badge } from './ui/badge';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
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
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleData = [
  { id: '1', name: 'أحمد علي', email: 'ahmed@example.com', role: 'student', status: 'active' },
  { id: '2', name: 'سارة محمود', email: 'sara@example.com', role: 'teacher', status: 'active' },
  { id: '3', name: 'محمد حسن', email: 'mohammed@example.com', role: 'admin', status: 'inactive' },
  { id: '4', name: 'ليلى خالد', email: 'layla@example.com', role: 'student', status: 'active' },
  { id: '5', name: 'عمر يوسف', email: 'omar@example.com', role: 'student', status: 'pending' },
];

const columns = [
  {
    key: 'name',
    title: 'الاسم',
    sortable: true,
    render: (value: string) => <span className="font-bold">{value}</span>,
  },
  {
    key: 'email',
    title: 'البريد الإلكتروني',
  },
  {
    key: 'role',
    title: 'الدور',
    sortable: true,
    render: (value: string) => (
      <Badge variant="outline" className="capitalize">
        {value === 'student' ? 'طالب' : value === 'teacher' ? 'مدرس' : 'مسؤول'}
      </Badge>
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
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: columns,
    searchPlaceholder: 'بحث في البيانات...',
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: columns,
    emptyMessage: 'لا توجد بيانات متاحة حالياً',
  },
};

export const WithRowActions: Story = {
  args: {
    data: sampleData,
    columns: columns,
    rowActions: (item) => (
      <div className="flex flex-col gap-1 p-1">
        <button className="text-right px-2 py-1 hover:bg-muted rounded text-sm font-bold" onClick={() => alert(`تعديل ${item.name}`)}>تعديل</button>
        <button className="text-right px-2 py-1 hover:bg-muted rounded text-sm font-bold text-destructive" onClick={() => alert(`حذف ${item.name}`)}>حذف</button>
      </div>
    ),
  },
};

export const WithBulkActions: Story = {
  args: {
    data: sampleData,
    columns: columns,
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
    columns: columns,
    currentPage: 1,
    totalPages: 5,
    totalItems: 25,
    pageSize: 5,
    onPageChange: (page) => console.log('Page changed to:', page),
  },
};

export const CustomRowActions: Story = {
  args: {
    data: sampleData,
    columns: columns,
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

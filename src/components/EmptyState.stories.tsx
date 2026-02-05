import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Users, Search, BookX, AlertCircle } from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
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
    actionLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: Users,
    title: 'لا يوجد طلاب',
    description: 'لم يتم العثور على أي طلاب في النظام حالياً. يمكنك البدء بإضافة طلاب جدد.',
    actionLabel: 'إضافة طالب جديد',
    onAction: () => alert('إضافة طالب'),
  },
};

export const SearchNoResults: Story = {
  args: {
    icon: Search,
    title: 'لا توجد نتائج بحث',
    description: 'عذراً، لم نتمكن من العثور على ما تبحث عنه. جرب كلمات بحث مختلفة.',
    actionLabel: 'مسح البحث',
    onAction: () => alert('مسح البحث'),
  },
};

export const CoursesEmpty: Story = {
  args: {
    icon: BookX,
    title: 'لا توجد مقررات',
    description: 'لم يتم تسجيل أي مقررات دراسية لهذا الفصل بعد.',
    actionLabel: 'إضافة مقرر',
    onAction: () => alert('إضافة مقرر'),
  },
};

export const ErrorState: Story = {
  args: {
    icon: AlertCircle,
    title: 'خطأ في التحميل',
    description: 'حدث خطأ أثناء محاولة جلب البيانات. يرجى المحاولة مرة أخرى لاحقاً.',
    actionLabel: 'إعادة المحاولة',
    onAction: () => alert('إعادة المحاولة'),
  },
};

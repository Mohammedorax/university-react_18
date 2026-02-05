import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';
import { Users, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div dir="rtl" className="font-cairo w-[300px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isWarning: { control: 'boolean' },
    value: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    icon: Users,
    label: 'إجمالي الطلاب',
    value: '1,234',
  },
};

export const Courses: Story = {
  args: {
    icon: BookOpen,
    label: 'المقررات الدراسية',
    value: '45',
    colorClass: 'bg-blue-500/20 text-blue-200',
  },
};

export const SuccessRate: Story = {
  args: {
    icon: TrendingUp,
    label: 'نسبة النجاح',
    value: '94.5%',
    colorClass: 'bg-emerald-500/20 text-emerald-200',
  },
};

export const Warning: Story = {
  args: {
    icon: AlertCircle,
    label: 'تنبيهات النظام',
    value: '12',
    isWarning: true,
  },
};

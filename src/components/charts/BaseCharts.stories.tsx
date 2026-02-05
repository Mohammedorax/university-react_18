import type { Meta, StoryObj } from '@storybook/react';
import { BaseAreaChart, BasePieChart, BaseBarChart } from './BaseCharts';

const meta: Meta = {
  title: 'Components/Charts',
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

const areaData = [
  { month: 'يناير', students: 400, teachers: 240 },
  { month: 'فبراير', students: 300, teachers: 139 },
  { month: 'مارس', students: 200, teachers: 980 },
  { month: 'أبريل', students: 278, teachers: 390 },
  { month: 'مايو', students: 189, teachers: 480 },
  { month: 'يونيو', students: 239, teachers: 380 },
  { month: 'يوليو', students: 349, teachers: 430 },
];

const pieData = [
  { name: 'علوم الحاسب', value: 400 },
  { name: 'هندسة البرمجيات', value: 300 },
  { name: 'نظم المعلومات', value: 300 },
  { name: 'الذكاء الاصطناعي', value: 200 },
];

const barData = [
  { name: '4.0', count: 45 },
  { name: '3.5-3.75', count: 82 },
  { name: '3.0-3.5', count: 125 },
  { name: '2.5-3.0', count: 65 },
  { name: '2.0-2.5', count: 32 },
  { name: '< 2.0', count: 12 },
];

export const AreaChart: StoryObj<typeof BaseAreaChart> = {
  render: (args) => (
    <div className="h-[400px] w-full bg-card p-6 rounded-3xl shadow-xl">
      <BaseAreaChart {...args} />
    </div>
  ),
  args: {
    data: areaData,
    dataKey: 'students',
    categoryKey: 'month',
    ariaLabel: 'نمو الطلاب خلال السنة',
    tableCaption: 'بيانات نمو الطلاب شهرياً',
  },
};

export const MultiSeriesAreaChart: StoryObj<typeof BaseAreaChart> = {
  render: (args) => (
    <div className="h-[400px] w-full bg-card p-6 rounded-3xl shadow-xl">
      <BaseAreaChart {...args} />
    </div>
  ),
  args: {
    data: areaData,
    dataKey: 'students',
    categoryKey: 'month',
    ariaLabel: 'نمو الطلاب والمدرسين',
    tableCaption: 'مقارنة بين نمو الطلاب والمدرسين',
  },
};

export const PieChart: StoryObj<typeof BasePieChart> = {
  render: (args) => (
    <div className="h-[400px] w-full bg-card p-6 rounded-3xl shadow-xl">
      <BasePieChart {...args} />
    </div>
  ),
  args: {
    data: pieData,
    ariaLabel: 'توزيع الطلاب حسب الأقسام',
    colors: ['hsl(var(--primary))', 'hsl(var(--primary)/0.8)', 'hsl(var(--primary)/0.6)', 'hsl(var(--primary)/0.4)'],
  },
};

export const BarChart: StoryObj<typeof BaseBarChart> = {
  render: (args) => (
    <div className="h-[400px] w-full bg-card p-6 rounded-3xl shadow-xl">
      <BaseBarChart {...args} />
    </div>
  ),
  args: {
    data: barData,
    dataKey: 'count',
    categoryKey: 'name',
    ariaLabel: 'توزيع المعدلات التراكمية',
    tableCaption: 'توزيع عدد الطلاب حسب فئات المعدل التراكمي',
  },
};

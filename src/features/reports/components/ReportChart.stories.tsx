import type { Meta, StoryObj } from '@storybook/react';
import { ReportChart } from './ReportChart';

const meta: Meta<typeof ReportChart> = {
  title: 'Features/Reports/ReportChart',
  component: ReportChart,
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
    type: {
      control: 'select',
      options: ['pie', 'bar', 'area'],
    },
    height: { control: 'number' },
    isEmpty: { control: 'boolean' },
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReportChart>;

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

const areaData = [
  { month: 'يناير', students: 400, teachers: 240 },
  { month: 'فبراير', students: 300, teachers: 139 },
  { month: 'مارس', students: 200, teachers: 980 },
  { month: 'أبريل', students: 278, teachers: 390 },
  { month: 'مايو', students: 189, teachers: 480 },
  { month: 'يونيو', students: 239, teachers: 380 },
];

export const PieChart: Story = {
  args: {
    title: 'توزيع الطلاب حسب الأقسام',
    description: 'إحصائية توضح عدد الطلاب في كل قسم',
    type: 'pie',
    data: pieData,
    height: 350,
    isEmpty: false,
  },
};

export const BarChart: Story = {
  args: {
    title: 'توزيع المعدلات التراكمية',
    description: 'عدد الطلاب في كل فئة من فئات المعدل التراكمي',
    type: 'bar',
    data: barData,
    height: 350,
    isEmpty: false,
    layout: 'horizontal',
  },
};

export const AreaChart: Story = {
  args: {
    title: 'نمو الطلاب والمدرسين',
    description: 'مقارنة بين عدد الطلاب والمدرسين خلال الأشهر',
    type: 'area',
    data: areaData,
    height: 350,
    isEmpty: false,
    dataKey: 'students',
    categoryKey: 'month',
    showYAxis: true,
    series: [
      { dataKey: 'students', name: 'الطلاب', color: 'hsl(var(--primary))' },
      { dataKey: 'teachers', name: 'المدرسين', color: 'hsl(var(--primary) / 0.6)' },
    ],
  },
};

export const EmptyPie: Story = {
  args: {
    title: 'توزيع الطلاب حسب الأقسام',
    description: 'لا توجد بيانات متاحة',
    type: 'pie',
    data: [],
    height: 350,
    isEmpty: true,
    emptyTitle: 'لا توجد بيانات',
    emptyDescription: 'لم يتم تسجيل أي طلاب في الأقسام حالياً',
  },
};

export const EmptyBar: Story = {
  args: {
    title: 'توزيع المعدلات التراكمية',
    description: 'لا توجد بيانات متاحة',
    type: 'bar',
    data: [],
    height: 350,
    isEmpty: true,
    emptyTitle: 'لا توجد بيانات',
    emptyDescription: 'لم يتم تسجيل أي درجات حالياً',
  },
};

export const CustomHeight: Story = {
  args: {
    title: 'مخطط بحجم مخصص',
    description: 'هذا المخطط له ارتفاع مخصص',
    type: 'pie',
    data: pieData,
    height: 500,
    isEmpty: false,
  },
};

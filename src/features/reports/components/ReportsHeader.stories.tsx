import type { Meta, StoryObj } from '@storybook/react';
import { ReportsHeader } from './ReportsHeader';
import { PieChartIcon } from 'lucide-react';

const meta: Meta<typeof ReportsHeader> = {
  title: 'Features/Reports/ReportsHeader',
  component: ReportsHeader,
  parameters: {
    layout: 'fullscreen',
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
    totalStudents: { control: 'number' },
    totalCourses: { control: 'number' },
    successRate: { control: 'number' },
    failingStudentsCount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof ReportsHeader>;

export const Default: Story = {
  args: {
    isLoading: false,
    totalStudents: 1234,
    totalCourses: 45,
    successRate: 94.5,
    failingStudentsCount: 12,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    totalStudents: 0,
    totalCourses: 0,
    successRate: 0,
    failingStudentsCount: 0,
  },
};

export const NoFailingStudents: Story = {
  args: {
    isLoading: false,
    totalStudents: 2000,
    totalCourses: 60,
    successRate: 98.2,
    failingStudentsCount: 0,
  },
};

export const HighFailureRate: Story = {
  args: {
    isLoading: false,
    totalStudents: 1500,
    totalCourses: 50,
    successRate: 65.3,
    failingStudentsCount: 150,
  },
};

export const SmallNumbers: Story = {
  args: {
    isLoading: false,
    totalStudents: 25,
    totalCourses: 5,
    successRate: 88.0,
    failingStudentsCount: 3,
  },
};

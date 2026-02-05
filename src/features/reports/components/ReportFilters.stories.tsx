import type { Meta, StoryObj } from '@storybook/react';
import { ReportFilters } from './ReportFilters';
import { useState, type FC } from 'react';

const meta: Meta<typeof ReportFilters> = {
  title: 'Features/Reports/ReportFilters',
  component: ReportFilters,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div dir="rtl" className="font-cairo bg-primary/90 p-6 rounded-2xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    searchTerm: { control: 'text' },
    selectedDepartment: { control: 'text' },
    onSearchChange: { action: 'searchChanged' },
    onDepartmentChange: { action: 'departmentChanged' },
    onDateRangeChange: { action: 'dateRangeChanged' },
    onRefresh: { action: 'refresh' },
    onReset: { action: 'reset' },
  },
};

export default meta;
type Story = StoryObj<typeof ReportFilters>;

const departments = ['جميع الأقسام', 'علوم الحاسب', 'هندسة البرمجيات', 'نظم المعلومات', 'الذكاء الاصطناعي'];

const FiltersWrapper: FC<any> = ({ searchTerm: initialSearch, selectedDepartment: initialDept, dateRange: initialDateRange, ...args }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedDept, setSelectedDept] = useState(initialDept || 'all');
  const [dateRange, setDateRange] = useState(initialDateRange);

  return (
    <ReportFilters
      {...args}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedDepartment={selectedDept}
      onDepartmentChange={setSelectedDept}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  );
};

export const Default: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    searchTerm: '',
    selectedDepartment: 'all',
    departments,
    dateRange: undefined,
  },
};

export const WithSearchTerm: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    departments,
  },
};

export const WithDepartmentSelected: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    departments,
  },
};

export const WithDateRange: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    departments,
  },
};

export const AllFiltersActive: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    departments,
  },
};

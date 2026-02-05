import type { Meta, StoryObj } from '@storybook/react';
import { ReportTypeSelector } from './ReportTypeSelector';
import { useState, type FC } from 'react';

const meta: Meta<typeof ReportTypeSelector> = {
  title: 'Features/Reports/ReportTypeSelector',
  component: ReportTypeSelector,
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
    activeTab: {
      control: 'select',
      options: ['general', 'academic', 'attendance'],
    },
    onTabChange: { action: 'tabChanged' },
  },
};

export default meta;
type Story = StoryObj<typeof ReportTypeSelector>;

export const Default: Story = {
  args: {
    activeTab: 'general',
  },
};

export const AcademicTab: Story = {
  args: {
    activeTab: 'academic',
  },
};

export const AttendanceTab: Story = {
  args: {
    activeTab: 'attendance',
  },
};

const InteractiveWrapper: FC<{ activeTab?: string }> = ({ activeTab: initialTab, ...args }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'general');
  return <ReportTypeSelector {...args} activeTab={activeTab} onTabChange={setActiveTab} />;
};

export const Interactive: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    activeTab: 'general',
  },
};

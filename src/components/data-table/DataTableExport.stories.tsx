import type { Meta, StoryObj } from '@storybook/react';
import { DataTableExport } from './DataTableExport';

const meta: Meta<typeof DataTableExport> = {
  title: 'Components/DataTable/DataTableExport',
  component: DataTableExport,
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
    disabled: { control: 'boolean' },
    onExportExcel: { action: 'exportExcel' },
    onExportPDF: { action: 'exportPDF' },
    onExportCSV: { action: 'exportCSV' },
  },
};

export default meta;
type Story = StoryObj<typeof DataTableExport>;

export const Default: Story = {
  args: {
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    return (
      <DataTableExport
        onExportExcel={() => alert('تم التصدير إلى Excel')}
        onExportPDF={() => alert('تم التصدير إلى PDF')}
        onExportCSV={() => alert('تم التصدير إلى CSV')}
        disabled={false}
      />
    );
  },
};

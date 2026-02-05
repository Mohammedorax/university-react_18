import type { Meta, StoryObj } from '@storybook/react';
import { ExportOptions } from './ExportOptions';
import { useState, type FC } from 'react';

const meta: Meta<typeof ExportOptions> = {
  title: 'Features/Reports/ExportOptions',
  component: ExportOptions,
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
    isExporting: { control: 'boolean' },
    onExportExcel: { action: 'exportExcel' },
    onPrint: { action: 'print' },
  },
};

export default meta;
type Story = StoryObj<typeof ExportOptions>;

export const Default: Story = {
  args: {
    isExporting: false,
  },
};

export const Exporting: Story = {
  args: {
    isExporting: true,
  },
};

const InteractiveWrapper: FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <ExportOptions
      isExporting={isExporting}
      onExportExcel={handleExport}
      onPrint={() => alert('جاري الطباعة...')}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveWrapper />,
};

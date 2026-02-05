import type { Meta, StoryObj } from '@storybook/react';
import { DataTableHeader } from './DataTableHeader';
import { useState, type FC } from 'react';

const meta: Meta<typeof DataTableHeader> = {
  title: 'Components/DataTable/DataTableHeader',
  component: DataTableHeader,
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
    density: {
      control: 'select',
      options: ['normal', 'compact'],
    },
    exportDisabled: { control: 'boolean' },
    searchPlaceholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DataTableHeader>;

const columns = [
  { key: 'name', title: 'الاسم', sortable: true },
  { key: 'email', title: 'البريد الإلكتروني' },
  { key: 'department', title: 'القسم', sortable: true },
  { key: 'status', title: 'الحالة', sortable: true },
  { key: 'gpa', title: 'المعدل', sortable: true },
];

const toggleColumn = (visibleColumns: Set<string>, key: string): Set<string> => {
  const newSet = new Set(visibleColumns);
  if (newSet.has(key)) {
    newSet.delete(key);
  } else {
    newSet.add(key);
  }
  return newSet;
};

const HeaderWrapper: FC<{ initialSearch?: string; initialDensity?: 'normal' | 'compact'; initialColumns?: Set<string> } & any> = ({
  searchTerm: initialSearch = '',
  density: initialDensity = 'normal',
  visibleColumns: initialCols,
  ...args
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [density, setDensity] = useState(initialDensity);
  const [visibleColumns, setVisibleColumns] = useState(initialCols || new Set(columns.map(c => c.key as string)));

  return (
    <DataTableHeader
      {...args}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      visibleColumns={visibleColumns}
      onToggleColumn={(key) => setVisibleColumns(toggleColumn(visibleColumns, key))}
      density={density}
      onToggleDensity={() => setDensity(density === 'normal' ? 'compact' : 'normal')}
      onExportExcel={() => alert('تصدير Excel')}
      onExportPDF={() => alert('تصدير PDF')}
      onExportCSV={() => alert('تصدير CSV')}
    />
  );
};

export const Default: Story = {
  render: (args) => <HeaderWrapper {...args} />,
  args: {
    density: 'normal',
    searchPlaceholder: 'بحث...',
    exportDisabled: false,
  },
};

export const WithSearch: Story = {
  render: (args) => <HeaderWrapper {...args} />,
  args: {
    density: 'normal',
    searchPlaceholder: 'بحث...',
    exportDisabled: false,
  },
};

export const CompactDensity: Story = {
  render: (args) => <HeaderWrapper {...args} />,
  args: {
    density: 'compact',
    searchPlaceholder: 'بحث...',
    exportDisabled: false,
  },
};

export const ExportDisabled: Story = {
  render: (args) => <HeaderWrapper {...args} />,
  args: {
    density: 'normal',
    searchPlaceholder: 'بحث...',
    exportDisabled: true,
  },
};

export const HiddenColumns: Story = {
  render: (args) => <HeaderWrapper {...args} />,
  args: {
    density: 'normal',
    searchPlaceholder: 'بحث...',
    exportDisabled: false,
  },
};

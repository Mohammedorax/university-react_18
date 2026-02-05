import type { Meta, StoryObj } from '@storybook/react';
import { DataTablePagination } from './DataTablePagination';
import { useState, type FC } from 'react';

const meta: Meta<typeof DataTablePagination> = {
  title: 'Components/DataTable/DataTablePagination',
  component: DataTablePagination,
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
    currentPage: { control: 'number' },
    totalPages: { control: 'number' },
    pageSize: { control: 'number' },
    totalItems: { control: 'number' },
    sortedDataLength: { control: 'number' },
    externalTotalItems: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof DataTablePagination>;

const PaginationWrapper: FC<any> = ({ currentPage: initialPage, ...args }) => {
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  return <DataTablePagination {...args} currentPage={currentPage} onPageChange={setCurrentPage} />;
};

export const Default: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    pageSize: 10,
    sortedDataLength: 50,
  },
};

export const FirstPage: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    pageSize: 10,
    sortedDataLength: 100,
  },
};

export const MiddlePage: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 5,
    totalPages: 10,
    totalItems: 100,
    pageSize: 10,
    sortedDataLength: 100,
  },
};

export const LastPage: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 10,
    totalPages: 10,
    totalItems: 100,
    pageSize: 10,
    sortedDataLength: 100,
  },
};

export const ManyPages: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 15,
    totalPages: 25,
    totalItems: 250,
    pageSize: 10,
    sortedDataLength: 250,
  },
};

export const ExternalPagination: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 3,
    totalPages: 10,
    totalItems: 100,
    externalTotalItems: 1000,
    pageSize: 10,
    sortedDataLength: 100,
  },
};

export const SmallData: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 1,
    totalPages: 2,
    totalItems: 15,
    pageSize: 10,
    sortedDataLength: 15,
  },
};

export const SinglePage: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 5,
    pageSize: 10,
    sortedDataLength: 5,
  },
};

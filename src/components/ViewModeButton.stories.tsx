import type { Meta, StoryObj } from '@storybook/react';
import { ViewModeButton } from './ViewModeButton';
import { List, LayoutGrid } from 'lucide-react';

const meta: Meta<typeof ViewModeButton> = {
  title: 'Components/ViewModeButton',
  component: ViewModeButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ViewModeButton>;

export const TableActive: Story = {
  args: {
    active: true,
    icon: List,
    label: 'عرض جدولي',
  },
};

export const TableInactive: Story = {
  args: {
    active: false,
    icon: List,
    label: 'عرض جدولي',
  },
};

export const GridActive: Story = {
  args: {
    active: true,
    icon: LayoutGrid,
    label: 'عرض شبكي',
  },
};

export const GridInactive: Story = {
  args: {
    active: false,
    icon: LayoutGrid,
    label: 'عرض شبكي',
  },
};

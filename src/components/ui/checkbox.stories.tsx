import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';
import { Label } from './label';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div dir="rtl" className="font-cairo flex items-center gap-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => (
    <>
      <Checkbox id="terms" {...args} />
      <Label htmlFor="terms">الموافقة على الشروط والأحكام</Label>
    </>
  ),
};

export const Checked: Story = {
  render: (args) => (
    <>
      <Checkbox id="checked" defaultChecked {...args} />
      <Label htmlFor="checked">خيار محدد مسبقاً</Label>
    </>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <>
      <Checkbox id="disabled" disabled {...args} />
      <Label htmlFor="disabled" className="opacity-50">خيار غير مفعّل</Label>
    </>
  ),
};

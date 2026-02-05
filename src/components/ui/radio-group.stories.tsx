import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
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
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup defaultValue="option-one" {...args}>
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">الخيار الأول</Label>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">الخيار الثاني</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <RadioGroup defaultValue="option-one" disabled {...args}>
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">الخيار الأول (معطل)</Label>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">الخيار الثاني (معطل)</Label>
      </div>
    </RadioGroup>
  ),
};

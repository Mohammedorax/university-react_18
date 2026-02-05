import type { Meta, StoryObj } from '@storybook/react';
import { ErrorHandlingExample } from './ErrorHandlingExample';

const meta: Meta<typeof ErrorHandlingExample> = {
  title: 'Components/Examples/ErrorHandlingExample',
  component: ErrorHandlingExample,
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
type Story = StoryObj<typeof ErrorHandlingExample>;

export const Default: Story = {
  args: {},
};

export const Interactive: Story = {
  render: () => <ErrorHandlingExample />,
};

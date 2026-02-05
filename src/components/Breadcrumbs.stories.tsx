import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="p-4 bg-background">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  parameters: {
    // This is a bit tricky since it uses useLocation()
    // In a real Storybook setup, we would use a decorator to mock the location
  }
};

import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Car, Fuel, Settings as SettingsIcon } from 'lucide-react';
import { FloatingActionButton } from './floating-action-button';

const meta = {
  title: 'UI/FloatingActionButton',
  component: FloatingActionButton,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => alert('FAB clicked!'),
  },
  decorators: [
    (Story) => (
      <div className="h-96 relative">
        <Story />
      </div>
    ),
  ],
};

export const AddCar: Story = {
  args: {
    icon: Car,
    label: 'Add Car',
    onClick: () => alert('Add car clicked!'),
  },
  decorators: [
    (Story) => (
      <div className="h-96 relative">
        <Story />
      </div>
    ),
  ],
};

export const AddFuelLog: Story = {
  args: {
    icon: Fuel,
    label: 'Add Fuel Log',
    onClick: () => alert('Add fuel log clicked!'),
  },
  decorators: [
    (Story) => (
      <div className="h-96 relative">
        <Story />
      </div>
    ),
  ],
};

export const Settings: Story = {
  args: {
    icon: SettingsIcon,
    label: 'Settings',
    onClick: () => alert('Settings clicked!'),
  },
  decorators: [
    (Story) => (
      <div className="h-96 relative">
        <Story />
      </div>
    ),
  ],
};
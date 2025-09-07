import type { Meta, StoryObj } from '@storybook/react';
import { Car, Download, Settings, Trash2 } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Add Fuel Log',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'View Analytics',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Car',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Export Data',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Cancel',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Learn more',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Car className="w-4 h-4" />
        Add Car
      </>
    ),
  },
};

export const IconButton: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <Settings className="w-4 h-4" />,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: (
      <>
        <Download className="w-4 h-4" />
        Download Report
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <>
        <Trash2 className="w-4 h-4" />
        Delete
      </>
    ),
  },
};
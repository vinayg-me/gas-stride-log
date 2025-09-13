import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const FuelTypes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Petrol</Badge>
      <Badge variant="secondary">Diesel</Badge>
      <Badge variant="outline">CNG</Badge>
      <Badge variant="destructive">Electric</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Synced</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Offline</Badge>
    </div>
  ),
};

export const WithNumbers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">2</Badge>
      <Badge variant="secondary">5</Badge>
      <Badge variant="destructive">12</Badge>
      <Badge variant="outline">99+</Badge>
    </div>
  ),
};

export const FuelEfficiency: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Excellent (20+ km/L)</Badge>
      <Badge variant="secondary">Good (15-20 km/L)</Badge>
      <Badge variant="outline">Average (10-15 km/L)</Badge>
      <Badge variant="destructive">Poor (&lt;10 km/L)</Badge>
    </div>
  ),
};

export const CarInfo: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Honda City</span>
        <Badge variant="secondary">2020</Badge>
        <Badge variant="outline">Petrol</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">KA-01-AB-1234</span>
        <Badge variant="default">Active</Badge>
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Success</Badge>
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Info</Badge>
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Warning</Badge>
      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Premium</Badge>
    </div>
  ),
};

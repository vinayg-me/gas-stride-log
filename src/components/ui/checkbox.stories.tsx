import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const FuelLogOptions: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="full-tank" />
        <Label htmlFor="full-tank">Full tank fill</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="premium-fuel" />
        <Label htmlFor="premium-fuel">Premium fuel</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="highway-driving" />
        <Label htmlFor="highway-driving">Highway driving</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="city-driving" />
        <Label htmlFor="city-driving">City driving</Label>
      </div>
    </div>
  ),
};

export const NotificationSettings: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Preferences</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="price-alerts" defaultChecked />
          <Label htmlFor="price-alerts">Fuel price alerts</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="maintenance-reminders" defaultChecked />
          <Label htmlFor="maintenance-reminders">Maintenance reminders</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="sync-notifications" />
          <Label htmlFor="sync-notifications">Sync notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="weekly-reports" defaultChecked />
          <Label htmlFor="weekly-reports">Weekly reports</Label>
        </div>
      </div>
    </div>
  ),
};

export const CarSelection: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Cars</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="honda-city" defaultChecked />
          <Label htmlFor="honda-city">Honda City (KA-01-AB-1234)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="maruti-swift" />
          <Label htmlFor="maruti-swift">Maruti Swift (TN-09-BC-5678)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="bmw-320i" />
          <Label htmlFor="bmw-320i">BMW 320i (DL-01-CD-9999)</Label>
        </div>
      </div>
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="select-all" />
        <Label htmlFor="select-all">Select all fuel logs</Label>
      </div>
      <div className="ml-6 space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="log-1" />
          <Label htmlFor="log-1">December 7, 2024</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="log-2" />
          <Label htmlFor="log-2">December 1, 2024</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="log-3" />
          <Label htmlFor="log-3">November 25, 2024</Label>
        </div>
      </div>
    </div>
  ),
};

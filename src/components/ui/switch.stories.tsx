import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './switch';
import { Label } from './label';

const meta = {
  title: 'UI/Switch',
  component: Switch,
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
} satisfies Meta<typeof Switch>;

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
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const NotificationSettings: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="price-alerts">Fuel Price Alerts</Label>
          <Switch id="price-alerts" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="maintenance-reminders">Maintenance Reminders</Label>
          <Switch id="maintenance-reminders" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sync-notifications">Sync Notifications</Label>
          <Switch id="sync-notifications" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="weekly-reports">Weekly Reports</Label>
          <Switch id="weekly-reports" defaultChecked />
        </div>
      </div>
    </div>
  ),
};

export const AppSettings: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">App Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
          </div>
          <Switch id="dark-mode" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-sync">Auto Sync</Label>
            <p className="text-sm text-muted-foreground">Automatically sync data when online</p>
          </div>
          <Switch id="auto-sync" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="location-tracking">Location Tracking</Label>
            <p className="text-sm text-muted-foreground">Track location for fuel station suggestions</p>
          </div>
          <Switch id="location-tracking" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="analytics">Analytics</Label>
            <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
          </div>
          <Switch id="analytics" defaultChecked />
        </div>
      </div>
    </div>
  ),
};

export const FuelLogOptions: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Fuel Log Options</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="full-tank">Full Tank Fill</Label>
          <Switch id="full-tank" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="premium-fuel">Premium Fuel</Label>
          <Switch id="premium-fuel" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="highway-driving">Highway Driving</Label>
          <Switch id="highway-driving" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ac-usage">AC Usage</Label>
          <Switch id="ac-usage" />
        </div>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [isEnabled, setIsEnabled] = useState(false);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="controlled-switch"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="controlled-switch">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Current state: {isEnabled ? 'ON' : 'OFF'}
        </p>
      </div>
    );
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="small-switch" className="h-4 w-8" />
        <Label htmlFor="small-switch">Small Switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="default-switch" />
        <Label htmlFor="default-switch">Default Switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="large-switch" className="h-8 w-14" />
        <Label htmlFor="large-switch">Large Switch</Label>
      </div>
    </div>
  ),
};

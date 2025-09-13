import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, Settings, User, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-sm text-muted-foreground">
            Set the dimensions for the layer.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FuelLogForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Add Fuel Log
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Add Fuel Log</h4>
            <p className="text-sm text-muted-foreground">
              Record your fuel consumption details.
            </p>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer Reading</Label>
              <Input id="odometer" type="number" placeholder="Enter odometer reading" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-amount">Fuel Amount (L)</Label>
              <Input id="fuel-amount" type="number" step="0.01" placeholder="Enter fuel amount" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Liter</Label>
              <Input id="price" type="number" step="0.01" placeholder="Enter price per liter" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Cancel</Button>
              <Button className="flex-1">Save</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const UserMenu: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">John Doe</span>
          </div>
          <Separator />
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          </div>
          <Separator />
          <Button variant="ghost" className="w-full justify-start text-destructive">
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const QuickActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            Edit
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Duplicate
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Share
          </Button>
          <Separator />
          <Button variant="ghost" className="w-full justify-start text-destructive">
            Delete
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FuelStationInfo: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link">Indian Oil - Koramangala</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">Indian Oil - Koramangala</h4>
            <p className="text-sm text-muted-foreground">
              123, 5th Block, Koramangala, Bangalore
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Petrol Price</span>
              <span className="font-medium">₹95.50/L</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Diesel Price</span>
              <span className="font-medium">₹87.20/L</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Updated</span>
              <span className="font-medium">2 hours ago</span>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Directions
            </Button>
            <Button size="sm" className="flex-1">
              Set as Default
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FilterOptions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Filter Options</h4>
            <p className="text-sm text-muted-foreground">
              Customize your fuel log view
            </p>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="From" type="date" />
                <Input placeholder="To" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Petrol</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Diesel</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">CNG</span>
                </label>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Clear
            </Button>
            <Button size="sm" className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const NotificationCenter: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <HelpCircle className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have 3 new notifications
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="p-2 border rounded-lg">
              <p className="text-sm font-medium">Fuel Price Alert</p>
              <p className="text-xs text-muted-foreground">
                Prices dropped at your regular station
              </p>
            </div>
            <div className="p-2 border rounded-lg">
              <p className="text-sm font-medium">Maintenance Reminder</p>
              <p className="text-xs text-muted-foreground">
                Your car is due for service
              </p>
            </div>
            <div className="p-2 border rounded-lg">
              <p className="text-sm font-medium">Weekly Report</p>
              <p className="text-xs text-muted-foreground">
                Your efficiency report is ready
              </p>
            </div>
          </div>
          <Separator />
          <Button variant="ghost" className="w-full">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

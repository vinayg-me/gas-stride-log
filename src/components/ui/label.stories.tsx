import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';
import { Checkbox } from './checkbox';
import { Switch } from './switch';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Label>Label</Label>,
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithSwitch: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
    </RadioGroup>
  ),
};

export const FuelLogForm: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="odometer">Odometer Reading (km)</Label>
        <Input id="odometer" type="number" placeholder="Enter odometer reading" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fuel-amount">Fuel Amount (L)</Label>
        <Input id="fuel-amount" type="number" step="0.01" placeholder="Enter fuel amount" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price per Liter (₹)</Label>
        <Input id="price" type="number" step="0.01" placeholder="Enter price per liter" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="station">Fuel Station</Label>
        <Input id="station" placeholder="Enter fuel station name" />
      </div>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="required-field" className="after:content-['*'] after:text-red-500 after:ml-1">
        Required Field
      </Label>
      <Input id="required-field" placeholder="This field is required" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="disabled-field" className="text-muted-foreground">
        Disabled Field
      </Label>
      <Input id="disabled-field" placeholder="This field is disabled" disabled />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter your password" />
      <p className="text-sm text-muted-foreground">
        Must be at least 8 characters long
      </p>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Small Label</Label>
        <Input className="h-8" placeholder="Small input" />
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Default Label</Label>
        <Input placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label className="text-base">Large Label</Label>
        <Input className="h-12 text-lg" placeholder="Large input" />
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-primary font-semibold">Primary Label</Label>
        <Input placeholder="Primary styled label" />
      </div>
      <div className="space-y-2">
        <Label className="text-destructive font-semibold">Error Label</Label>
        <Input placeholder="Error styled label" />
      </div>
      <div className="space-y-2">
        <Label className="text-green-600 font-semibold">Success Label</Label>
        <Input placeholder="Success styled label" />
      </div>
    </div>
  ),
};

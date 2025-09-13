import type { Meta, StoryObj } from '@storybook/react';
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input placeholder="Search..." className="pl-10" />
    </div>
  ),
};

export const Password: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm font-medium">
        Password
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input id="password" type="password" placeholder="Enter password" className="pl-10 pr-10" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Error: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="error-input" className="text-sm font-medium text-destructive">
        Email
      </label>
      <Input
        id="error-input"
        type="email"
        placeholder="Enter your email"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">Please enter a valid email address.</p>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Small</label>
        <Input placeholder="Small input" className="h-8" />
      </div>
      <div>
        <label className="text-sm font-medium">Default</label>
        <Input placeholder="Default input" />
      </div>
      <div>
        <label className="text-sm font-medium">Large</label>
        <Input placeholder="Large input" className="h-12 text-lg" />
      </div>
    </div>
  ),
};

export const FuelLogForm: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label htmlFor="odometer" className="text-sm font-medium">
          Odometer Reading (km)
        </label>
        <Input
          id="odometer"
          type="number"
          placeholder="Enter odometer reading"
          className="text-right"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="fuel-amount" className="text-sm font-medium">
          Fuel Amount (L)
        </label>
        <Input
          id="fuel-amount"
          type="number"
          placeholder="Enter fuel amount"
          step="0.01"
          className="text-right"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          Price per Liter (₹)
        </label>
        <Input
          id="price"
          type="number"
          placeholder="Enter price per liter"
          step="0.01"
          className="text-right"
        />
      </div>
    </div>
  ),
};

export const SearchInput: Story = {
  render: () => (
    <div className="relative w-80">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input placeholder="Search cars, fuel logs..." className="pl-10" />
    </div>
  ),
};

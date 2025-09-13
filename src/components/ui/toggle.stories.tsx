import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Grid, List } from 'lucide-react';
import { Toggle } from './toggle';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Toggle',
  },
};

export const WithIcon: Story = {
  args: {
    children: <Bold className="h-4 w-4" />,
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Toggle',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const TextFormatting: Story = {
  render: () => (
    <div className="flex items-center space-x-1">
      <Toggle aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const TextAlignment: Story = {
  render: () => (
    <div className="flex items-center space-x-1">
      <Toggle aria-label="Align left">
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Align center">
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Align right">
        <AlignRight className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const ViewToggle: Story = {
  render: () => (
    <div className="flex items-center space-x-1">
      <Toggle aria-label="Grid view">
        <Grid className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="List view">
        <List className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const FuelLogFilters: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Filters:</span>
        <Toggle aria-label="Full tank">
          Full Tank
        </Toggle>
        <Toggle aria-label="Highway driving">
          Highway
        </Toggle>
        <Toggle aria-label="City driving">
          City
        </Toggle>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const Pressed: Story = {
  args: {
    pressed: true,
    children: 'Pressed',
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Toggle size="sm" aria-label="Small toggle">
        <Bold className="h-3 w-3" />
      </Toggle>
      <Toggle size="default" aria-label="Default toggle">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="lg" aria-label="Large toggle">
        <Bold className="h-5 w-5" />
      </Toggle>
    </div>
  ),
};

export const ToggleGroup: Story = {
  render: () => (
    <div className="flex items-center space-x-1">
      <Toggle variant="outline" aria-label="Bold">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="Underline">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Toggle aria-label="Toggle feature">
        <Bold className="h-4 w-4 mr-2" />
        Bold
      </Toggle>
      <Toggle aria-label="Toggle another feature">
        <Italic className="h-4 w-4 mr-2" />
        Italic
      </Toggle>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Toggle className="bg-primary text-primary-foreground hover:bg-primary/90">
        Primary
      </Toggle>
      <Toggle className="bg-green-500 text-white hover:bg-green-600">
        Success
      </Toggle>
      <Toggle className="bg-red-500 text-white hover:bg-red-600">
        Danger
      </Toggle>
    </div>
  ),
};

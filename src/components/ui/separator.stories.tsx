import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[200px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">Fuel Logs</h4>
        <p className="text-sm text-muted-foreground">
          Track your fuel consumption and efficiency.
        </p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Analytics</h4>
        <p className="text-sm text-muted-foreground">
          View detailed insights and trends.
        </p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Settings</h4>
        <p className="text-sm text-muted-foreground">
          Configure your app preferences.
        </p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center space-x-4">
      <div className="text-sm">Home</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Dashboard</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Analytics</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Settings</div>
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="w-[400px]">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  ),
};

export const FuelLogSeparator: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">December 7, 2024</h4>
          <p className="text-sm text-muted-foreground">Honda City • 35.5L</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">₹3,390</p>
          <p className="text-xs text-muted-foreground">₹95.50/L</p>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">December 1, 2024</h4>
          <p className="text-sm text-muted-foreground">Maruti Swift • 32.0L</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">₹3,014</p>
          <p className="text-xs text-muted-foreground">₹94.20/L</p>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">November 25, 2024</h4>
          <p className="text-sm text-muted-foreground">BMW 320i • 45.0L</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">₹4,275</p>
          <p className="text-xs text-muted-foreground">₹95.00/L</p>
        </div>
      </div>
    </div>
  ),
};

export const NavigationSeparator: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-medium">Dashboard</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-muted" />
        <span className="text-sm text-muted-foreground">Fuel Logs</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-muted" />
        <span className="text-sm text-muted-foreground">Analytics</span>
      </div>
      <Separator className="my-2" />
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-muted" />
        <span className="text-sm text-muted-foreground">Settings</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-muted" />
        <span className="text-sm text-muted-foreground">Help</span>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">Default Separator</h4>
        <p className="text-sm text-muted-foreground">Standard separator styling</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Thick Separator</h4>
        <p className="text-sm text-muted-foreground">Custom thickness</p>
      </div>
      <Separator className="h-2" />
      <div>
        <h4 className="text-sm font-medium">Colored Separator</h4>
        <p className="text-sm text-muted-foreground">Custom color</p>
      </div>
      <Separator className="bg-primary" />
      <div>
        <h4 className="text-sm font-medium">Dashed Separator</h4>
        <p className="text-sm text-muted-foreground">Dashed border style</p>
      </div>
      <Separator className="border-dashed" />
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-[350px] p-6 border rounded-lg space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fuel Efficiency Report</h3>
        <p className="text-sm text-muted-foreground">Monthly summary</p>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Average Efficiency</p>
          <p className="text-2xl font-bold">18.5 km/L</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Distance</p>
          <p className="text-2xl font-bold">1,200 km</p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Fuel Used</p>
          <p className="text-2xl font-bold">65L</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">₹6,175</p>
        </div>
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { HelpCircle, Info, AlertTriangle, CheckCircle, Settings, Fuel, Car } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Button } from './button';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span>Fuel Efficiency</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Average kilometers per liter of fuel consumed</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const DifferentVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <Info className="w-4 h-4 mr-2" />
            Info
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is an informational tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Success
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Operation completed successfully</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Warning
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This action requires attention</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const FuelLogTooltips: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Odometer Reading</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Current odometer reading in kilometers</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Fuel Amount</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Amount of fuel filled in liters</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Price per Liter</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cost per liter of fuel in Indian Rupees</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};

export const CarStatsTooltips: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-80">
      <div className="text-center p-4 border rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Fuel className="w-5 h-5" />
          <span className="text-lg font-bold">18.5</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">km/L</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average fuel efficiency across all trips</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div className="text-center p-4 border rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Car className="w-5 h-5" />
          <span className="text-lg font-bold">15,000</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">km</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total distance traveled</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};

export const DisabledButton: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button disabled>Disabled Button</Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" disabled>
            <HelpCircle className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This button is disabled</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>
          Configure your app settings including notifications, 
          data sync preferences, and display options. You can 
          also manage your account and privacy settings here.
        </p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Default</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Default tooltip styling</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Custom</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-primary text-primary-foreground">
          <p>Custom styled tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Large</Button>
        </TooltipTrigger>
        <TooltipContent className="p-4">
          <p className="text-lg font-semibold">Large tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4" />
          <span className="font-medium">Fuel Efficiency</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold">18.5</span>
          <span className="text-sm text-muted-foreground">km/L</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average fuel efficiency</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4" />
          <span className="font-medium">Total Distance</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold">15,000</span>
          <span className="text-sm text-muted-foreground">km</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total distance traveled</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};

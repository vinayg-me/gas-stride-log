import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 33,
  },
};

export const Zero: Story = {
  args: {
    value: 0,
  },
};

export const Half: Story = {
  args: {
    value: 50,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const FuelTankLevel: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Fuel Tank Level</CardTitle>
        <CardDescription>Current fuel level in your tank</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fuel Level</span>
            <span>75%</span>
          </div>
          <Progress value={75} className="h-3" />
        </div>
        <div className="text-sm text-muted-foreground">
          Approximately 30L remaining in a 40L tank
        </div>
      </CardContent>
    </Card>
  ),
};

export const SyncProgress: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Syncing Data</CardTitle>
        <CardDescription>Uploading your fuel logs to the cloud</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>60%</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>
        <div className="text-sm text-muted-foreground">
          Syncing 15 of 25 fuel logs...
        </div>
      </CardContent>
    </Card>
  ),
};

export const MonthlyGoal: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Monthly Goal</CardTitle>
        <CardDescription>Track your fuel efficiency goal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Efficiency Target</span>
            <span>85%</span>
          </div>
          <Progress value={85} className="h-3" />
        </div>
        <div className="text-sm text-muted-foreground">
          You&apos;re 85% towards your monthly efficiency goal of 20 km/L
        </div>
      </CardContent>
    </Card>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <p className="text-sm font-medium">Small (h-1)</p>
        <Progress value={45} className="h-1" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Default (h-2)</p>
        <Progress value={65} className="h-2" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Medium (h-3)</p>
        <Progress value={80} className="h-3" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Large (h-4)</p>
        <Progress value={30} className="h-4" />
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <p className="text-sm font-medium">Success (Green)</p>
        <Progress value={90} className="h-3 [&>div]:bg-green-500" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Warning (Yellow)</p>
        <Progress value={60} className="h-3 [&>div]:bg-yellow-500" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Error (Red)</p>
        <Progress value={25} className="h-3 [&>div]:bg-red-500" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Info (Blue)</p>
        <Progress value={75} className="h-3 [&>div]:bg-blue-500" />
      </div>
    </div>
  ),
};

export const Animated: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Loading Progress</CardTitle>
        <CardDescription>Animated progress indicator</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing</span>
            <span>45%</span>
          </div>
          <Progress 
            value={45} 
            className="h-3 [&>div]:transition-all [&>div]:duration-500 [&>div]:ease-in-out" 
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Processing your fuel log data...
        </div>
      </CardContent>
    </Card>
  ),
};

export const MultipleProgress: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Fuel Efficiency Metrics</CardTitle>
        <CardDescription>Track multiple efficiency indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Efficiency</span>
            <span>18.5 km/L</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>City Driving</span>
            <span>15.2 km/L</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Highway Driving</span>
            <span>22.8 km/L</span>
          </div>
          <Progress value={90} className="h-2" />
        </div>
      </CardContent>
    </Card>
  ),
};

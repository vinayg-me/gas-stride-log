import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './slider';
import { Label } from './label';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <Label>Volume</Label>
        <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
      </div>
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <Label>Price Range</Label>
        <Slider defaultValue={[20, 80]} max={100} step={1} className="mt-2" />
      </div>
    </div>
  ),
};

export const FuelTankLevel: Story = {
  render: () => {
    const [value, setValue] = useState([75]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div>
          <Label>Fuel Tank Level</Label>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <span>Empty</span>
            <span className="font-medium">{value[0]}%</span>
            <span>Full</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Approximately {Math.round((value[0] / 100) * 40)}L remaining in a 40L tank
        </div>
      </div>
    );
  },
};

export const FuelEfficiency: Story = {
  render: () => {
    const [value, setValue] = useState([18.5]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div>
          <Label>Target Fuel Efficiency (km/L)</Label>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <span>5</span>
            <span className="font-medium">{value[0]} km/L</span>
            <span>30</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            min={5}
            max={30}
            step={0.1}
            className="mt-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Set your target fuel efficiency goal
        </div>
      </div>
    );
  },
};

export const PriceRange: Story = {
  render: () => {
    const [value, setValue] = useState([80, 120]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div>
          <Label>Fuel Price Range (₹/L)</Label>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <span>₹{value[0]}</span>
            <span className="font-medium">₹{value[0]} - ₹{value[1]}</span>
            <span>₹{value[1]}</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            min={50}
            max={150}
            step={1}
            className="mt-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Set your preferred fuel price range for alerts
        </div>
      </div>
    );
  },
};

export const DistanceRange: Story = {
  render: () => {
    const [value, setValue] = useState([100, 500]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div>
          <Label>Distance Range (km)</Label>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <span>{value[0]} km</span>
            <span className="font-medium">{value[0]} - {value[1]} km</span>
            <span>{value[1]} km</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={1000}
            step={10}
            className="mt-2"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Filter fuel logs by distance range
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <Label>Disabled Slider</Label>
        <Slider defaultValue={[50]} max={100} step={1} disabled className="mt-2" />
      </div>
    </div>
  ),
};

export const DifferentSteps: Story = {
  render: () => (
    <div className="w-[300px] space-y-6">
      <div>
        <Label>Step 1 (Default)</Label>
        <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
      </div>
      <div>
        <Label>Step 5</Label>
        <Slider defaultValue={[50]} max={100} step={5} className="mt-2" />
      </div>
      <div>
        <Label>Step 10</Label>
        <Slider defaultValue={[50]} max={100} step={10} className="mt-2" />
      </div>
      <div>
        <Label>Step 0.1 (Decimal)</Label>
        <Slider defaultValue={[5.5]} max={10} step={0.1} className="mt-2" />
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="w-[300px] space-y-6">
      <div>
        <Label>Default</Label>
        <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
      </div>
      <div>
        <Label>Success (Green)</Label>
        <Slider 
          defaultValue={[75]} 
          max={100} 
          step={1} 
          className="mt-2 [&>span]:bg-green-500" 
        />
      </div>
      <div>
        <Label>Warning (Yellow)</Label>
        <Slider 
          defaultValue={[50]} 
          max={100} 
          step={1} 
          className="mt-2 [&>span]:bg-yellow-500" 
        />
      </div>
      <div>
        <Label>Danger (Red)</Label>
        <Slider 
          defaultValue={[25]} 
          max={100} 
          step={1} 
          className="mt-2 [&>span]:bg-red-500" 
        />
      </div>
    </div>
  ),
};

export const WithMarks: Story = {
  render: () => {
    const [value, setValue] = useState([18.5]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div>
          <Label>Fuel Efficiency with Marks</Label>
          <div className="relative mt-2">
            <Slider
              value={value}
              onValueChange={setValue}
              min={10}
              max={30}
              step={0.5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Current efficiency: {value[0]} km/L
        </div>
      </div>
    );
  },
};

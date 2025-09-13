import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const FuelType: Story = {
  render: () => (
    <RadioGroup defaultValue="petrol">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="petrol" id="petrol" />
          <Label htmlFor="petrol">Petrol</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="diesel" id="diesel" />
          <Label htmlFor="diesel">Diesel</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cng" id="cng" />
          <Label htmlFor="cng">CNG</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="electric" id="electric" />
          <Label htmlFor="electric">Electric</Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const CarSelection: Story = {
  render: () => (
    <RadioGroup defaultValue="honda-city">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="honda-city" id="honda-city" />
          <Label htmlFor="honda-city">Honda City (KA-01-AB-1234)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="maruti-swift" id="maruti-swift" />
          <Label htmlFor="maruti-swift">Maruti Swift (TN-09-BC-5678)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bmw-320i" id="bmw-320i" />
          <Label htmlFor="bmw-320i">BMW 320i (DL-01-CD-9999)</Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const DistanceUnit: Story = {
  render: () => (
    <RadioGroup defaultValue="km">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="km" id="km" />
          <Label htmlFor="km">Kilometers (km)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="miles" id="miles" />
          <Label htmlFor="miles">Miles (mi)</Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Currency: Story = {
  render: () => (
    <RadioGroup defaultValue="inr">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="inr" id="inr" />
          <Label htmlFor="inr">Indian Rupee (₹)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="usd" id="usd" />
          <Label htmlFor="usd">US Dollar ($)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="eur" id="eur" />
          <Label htmlFor="eur">Euro (€)</Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" disabled />
          <Label htmlFor="option2" className="text-muted-foreground">Option 2 (Disabled)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option3" id="option3" />
          <Label htmlFor="option3">Option 3</Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="flex space-x-6">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="petrol">
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="petrol" id="petrol" className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor="petrol">Petrol</Label>
            <p className="text-sm text-muted-foreground">
              Most common fuel type, good for city and highway driving
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="diesel" id="diesel" className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor="diesel">Diesel</Label>
            <p className="text-sm text-muted-foreground">
              More fuel efficient, better for long distance driving
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="cng" id="cng" className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor="cng">CNG</Label>
            <p className="text-sm text-muted-foreground">
              Environmentally friendly, cost effective fuel option
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Fuel Type</Label>
        <RadioGroup defaultValue="petrol">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="petrol" id="form-petrol" />
              <Label htmlFor="form-petrol">Petrol</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="diesel" id="form-diesel" />
              <Label htmlFor="form-diesel">Diesel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cng" id="form-cng" />
              <Label htmlFor="form-cng">CNG</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-3">
        <Label className="text-base font-semibold">Distance Unit</Label>
        <RadioGroup defaultValue="km">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="km" id="form-km" />
              <Label htmlFor="form-km">Kilometers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="miles" id="form-miles" />
              <Label htmlFor="form-miles">Miles</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

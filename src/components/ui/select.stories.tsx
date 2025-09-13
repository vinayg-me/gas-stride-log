import type { Meta, StoryObj } from '@storybook/react';
import { Car, Fuel, Settings, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './select';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const FuelType: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select fuel type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="petrol">Petrol</SelectItem>
        <SelectItem value="diesel">Diesel</SelectItem>
        <SelectItem value="cng">CNG</SelectItem>
        <SelectItem value="electric">Electric</SelectItem>
        <SelectItem value="hybrid">Hybrid</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const CarSelection: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select a car" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>My Cars</SelectLabel>
          <SelectItem value="honda-city">Honda City (KA-01-AB-1234)</SelectItem>
          <SelectItem value="maruti-swift">Maruti Swift (TN-09-BC-5678)</SelectItem>
          <SelectItem value="bmw-320i">BMW 320i (DL-01-CD-9999)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Add New</SelectLabel>
          <SelectItem value="add-car">+ Add New Car</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Fuel Type</label>
        <Select>
          <SelectTrigger className="w-[200px]">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              <SelectValue placeholder="Select fuel type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="petrol">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Petrol
              </div>
            </SelectItem>
            <SelectItem value="diesel">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Diesel
              </div>
            </SelectItem>
            <SelectItem value="cng">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                CNG
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="diesel">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select fuel type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="petrol">Petrol</SelectItem>
        <SelectItem value="diesel">Diesel</SelectItem>
        <SelectItem value="cng">CNG</SelectItem>
        <SelectItem value="electric">Electric</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const FuelStation: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select fuel station" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Nearby Stations</SelectLabel>
          <SelectItem value="indian-oil">Indian Oil - Koramangala</SelectItem>
          <SelectItem value="hp">HP - Indiranagar</SelectItem>
          <SelectItem value="bharat-petroleum">Bharat Petroleum - MG Road</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other Stations</SelectLabel>
          <SelectItem value="reliance">Reliance - Whitefield</SelectItem>
          <SelectItem value="shell">Shell - Electronic City</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Currency: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
        <SelectItem value="usd">US Dollar ($)</SelectItem>
        <SelectItem value="eur">Euro (€)</SelectItem>
        <SelectItem value="gbp">British Pound (£)</SelectItem>
        <SelectItem value="jpy">Japanese Yen (¥)</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const DistanceUnit: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="km">Kilometers (km)</SelectItem>
        <SelectItem value="miles">Miles (mi)</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-sm font-medium">Car</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a car" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="honda-city">Honda City</SelectItem>
            <SelectItem value="maruti-swift">Maruti Swift</SelectItem>
            <SelectItem value="bmw-320i">BMW 320i</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Fuel Type</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select fuel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="petrol">Petrol</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="cng">CNG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Station</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="indian-oil">Indian Oil</SelectItem>
            <SelectItem value="hp">HP</SelectItem>
            <SelectItem value="bharat-petroleum">Bharat Petroleum</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

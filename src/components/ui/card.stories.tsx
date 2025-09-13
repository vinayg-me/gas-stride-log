import type { Meta, StoryObj } from '@storybook/react';
import { Fuel, Car, Settings, TrendingUp, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const FuelLogCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5" />
          Fuel Log Entry
        </CardTitle>
        <CardDescription>December 7, 2024</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Odometer</p>
            <p className="text-lg font-semibold">45,230 km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fuel Amount</p>
            <p className="text-lg font-semibold">35.5 L</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price/Liter</p>
            <p className="text-lg font-semibold">₹95.50</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold">₹3,390</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant="secondary">Petrol</Badge>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const CarStatsCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Honda City
        </CardTitle>
        <CardDescription>KA-01-AB-1234 • 2020</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold">18.5</span>
            </div>
            <p className="text-sm text-muted-foreground">km/L</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IndianRupee className="w-4 h-4" />
              <span className="text-2xl font-bold">4.2</span>
            </div>
            <p className="text-sm text-muted-foreground">₹/km</p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Distance</span>
            <span className="font-medium">15,000 km</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Spend</span>
            <span className="font-medium">₹25,000</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const SettingsCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          App Settings
        </CardTitle>
        <CardDescription>Manage your application preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Dark Mode</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notifications</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto Sync</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Reset
        </Button>
        <Button className="flex-1">
          Save
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
        <CardDescription>This card doesn't have a footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This is a simple card with just header and content sections.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithoutHeader: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Quick Stats</h3>
          <p className="text-muted-foreground">Your fuel efficiency summary</p>
          <div className="text-3xl font-bold text-primary">18.5 km/L</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Full Report</Button>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card className="w-[250px]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Fuel className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">Last Fill</p>
            <p className="text-sm text-muted-foreground">2 days ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

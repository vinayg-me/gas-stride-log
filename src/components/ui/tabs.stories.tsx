import type { Meta, StoryObj } from '@storybook/react';
import { Car, Fuel, Settings, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Account</h3>
          <p className="text-sm text-muted-foreground">
            Make changes to your account here. Click save when you&apos;re done.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Password</h3>
          <p className="text-sm text-muted-foreground">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const FuelLogTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Fuel Logs</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>Your fuel consumption summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Efficiency</p>
                <p className="text-2xl font-bold">18.5 km/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">15,000 km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="logs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5" />
              Recent Fuel Logs
            </CardTitle>
            <CardDescription>Your latest fuel fill entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">December 7, 2024</p>
                  <p className="text-sm text-muted-foreground">35.5L • ₹95.50/L</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">December 1, 2024</p>
                  <p className="text-sm text-muted-foreground">32.0L • ₹94.20/L</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analytics
            </CardTitle>
            <CardDescription>Detailed insights into your fuel consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Charts and detailed analytics would go here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
            <CardDescription>Configure your app preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Settings options would go here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const CarManagement: Story = {
  render: () => (
    <Tabs defaultValue="honda-city" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="honda-city">Honda City</TabsTrigger>
        <TabsTrigger value="maruti-swift">Maruti Swift</TabsTrigger>
        <TabsTrigger value="bmw-320i">BMW 320i</TabsTrigger>
      </TabsList>
      <TabsContent value="honda-city" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Honda City
            </CardTitle>
            <CardDescription>KA-01-AB-1234 • 2020 • Petrol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Efficiency</p>
                <p className="text-xl font-bold">18.5 km/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-xl font-bold">15,000 km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="maruti-swift" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Maruti Swift
            </CardTitle>
            <CardDescription>TN-09-BC-5678 • 2022 • Petrol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Efficiency</p>
                <p className="text-xl font-bold">22.8 km/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-xl font-bold">12,500 km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="bmw-320i" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              BMW 320i
            </CardTitle>
            <CardDescription>DL-01-CD-9999 • 2023 • Petrol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Efficiency</p>
                <p className="text-xl font-bold">12.5 km/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-xl font-bold">8,000 km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const VerticalTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" orientation="vertical" className="w-[600px]">
      <div className="flex">
        <TabsList className="flex-col h-auto w-48">
          <TabsTrigger value="overview" className="w-full justify-start">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="logs" className="w-full justify-start">
            <Fuel className="w-4 h-4 mr-2" />
            Fuel Logs
          </TabsTrigger>
          <TabsTrigger value="calendar" className="w-full justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 ml-4">
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Your fuel consumption overview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Overview content goes here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Fuel Logs</CardTitle>
                <CardDescription>Your fuel log entries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Fuel logs content goes here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Fuel log calendar view</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Calendar content goes here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>App configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings content goes here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="dashboard" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center gap-2">
          <Fuel className="w-4 h-4" />
          Logs
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Dashboard</h3>
          <p className="text-sm text-muted-foreground">Your fuel tracking dashboard</p>
        </div>
      </TabsContent>
      <TabsContent value="logs">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Fuel Logs</h3>
          <p className="text-sm text-muted-foreground">View and manage your fuel logs</p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your app settings</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

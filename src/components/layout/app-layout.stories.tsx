import type { Meta, StoryObj } from '@storybook/react';
import { AppLayout } from './app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const meta = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>Placeholder</div>,
  },
  render: () => (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Welcome to FuelTrackr</h1>
          <p className="text-muted-foreground mb-8">
            Track your fuel consumption and optimize your driving efficiency.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Distance</CardTitle>
                <CardDescription>Lifetime distance tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">15,000 km</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Efficiency</CardTitle>
                <CardDescription>Fuel efficiency across all cars</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">18.5 km/L</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Spend</CardTitle>
                <CardDescription>Amount spent on fuel</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₹25,000</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  ),
};

export const WithDashboard: Story = {
  args: {
    children: <div>Placeholder</div>,
  },
  render: () => (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Your fuel consumption overview</p>
            </div>
            <Button>Add Fuel Log</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Active vehicles</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹3,200</div>
                <p className="text-xs text-muted-foreground">Fuel spend</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5 km/L</div>
                <p className="text-xs text-muted-foreground">Average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Fill</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 days ago</div>
                <p className="text-xs text-muted-foreground">Honda City</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Fuel Logs</CardTitle>
                <CardDescription>Your latest fuel fill entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">December 7, 2024</p>
                      <p className="text-sm text-muted-foreground">Honda City • 35.5L</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹3,390</p>
                      <Badge variant="secondary">Petrol</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">December 1, 2024</p>
                      <p className="text-sm text-muted-foreground">Maruti Swift • 32.0L</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹3,014</p>
                      <Badge variant="secondary">Petrol</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">November 25, 2024</p>
                      <p className="text-sm text-muted-foreground">BMW 320i • 45.0L</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹4,275</p>
                      <Badge variant="secondary">Petrol</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Car Performance</CardTitle>
                <CardDescription>Efficiency comparison across vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Honda City</p>
                      <p className="text-sm text-muted-foreground">KA-01-AB-1234</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">18.5 km/L</p>
                      <Badge variant="default">Good</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maruti Swift</p>
                      <p className="text-sm text-muted-foreground">TN-09-BC-5678</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">22.8 km/L</p>
                      <Badge variant="default">Excellent</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">BMW 320i</p>
                      <p className="text-sm text-muted-foreground">DL-01-CD-9999</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">12.5 km/L</p>
                      <Badge variant="outline">Average</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  ),
};

export const WithForm: Story = {
  args: {
    children: <div>Placeholder</div>,
  },
  render: () => (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add Fuel Log</CardTitle>
              <CardDescription>Record your fuel consumption details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Odometer Reading</label>
                  <input 
                    type="number" 
                    placeholder="45230" 
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Amount (L)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="35.5" 
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price per Liter</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="95.50" 
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Station</label>
                  <input 
                    type="text" 
                    placeholder="Indian Oil" 
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea 
                  placeholder="Add any notes about this fuel fill..."
                  className="w-full px-3 py-2 border rounded-md h-20"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Cancel</Button>
                <Button className="flex-1">Save Fuel Log</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  ),
};

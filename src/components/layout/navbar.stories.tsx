import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './navbar';

const meta = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Synced: Story = {
  render: () => {
    // Mock the store to show synced state
    const mockStore = {
      syncStatus: 'synced' as const,
      isOnline: true,
    };
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground">
              This is a demo of the navbar component with synced status.
            </p>
          </div>
        </main>
      </div>
    );
  },
};

export const Syncing: Story = {
  render: () => {
    // Mock the store to show syncing state
    const mockStore = {
      syncStatus: 'syncing' as const,
      isOnline: true,
    };
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground">
              This is a demo of the navbar component with syncing status.
            </p>
          </div>
        </main>
      </div>
    );
  },
};

export const Pending: Story = {
  render: () => {
    // Mock the store to show pending state
    const mockStore = {
      syncStatus: 'pending' as const,
      isOnline: true,
    };
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground">
              This is a demo of the navbar component with pending sync status.
            </p>
          </div>
        </main>
      </div>
    );
  },
};

export const Offline: Story = {
  render: () => {
    // Mock the store to show offline state
    const mockStore = {
      syncStatus: 'pending' as const,
      isOnline: false,
    };
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground">
              This is a demo of the navbar component with offline status.
            </p>
          </div>
        </main>
      </div>
    );
  },
};

export const WithContent: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Fuel Tracking Dashboard</h1>
            <p className="text-muted-foreground">
              Track your fuel consumption and optimize your driving efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Distance</h3>
              <p className="text-3xl font-bold text-primary">15,000 km</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Average Efficiency</h3>
              <p className="text-3xl font-bold text-primary">18.5 km/L</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Spend</h3>
              <p className="text-3xl font-bold text-primary">₹25,000</p>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Fuel Logs</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">December 7, 2024</p>
                  <p className="text-sm text-muted-foreground">35.5L • ₹95.50/L</p>
                </div>
                <span className="text-sm text-muted-foreground">Honda City</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">December 1, 2024</p>
                  <p className="text-sm text-muted-foreground">32.0L • ₹94.20/L</p>
                </div>
                <span className="text-sm text-muted-foreground">Honda City</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  ),
};

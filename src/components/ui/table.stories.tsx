import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from './table';
import { Button } from './button';
import { Badge } from './badge';
import { Checkbox } from './checkbox';

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent fuel logs.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Date</TableHead>
          <TableHead>Car</TableHead>
          <TableHead>Fuel Amount</TableHead>
          <TableHead>Price/L</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Dec 7, 2024</TableCell>
          <TableCell>Honda City</TableCell>
          <TableCell>35.5L</TableCell>
          <TableCell>₹95.50</TableCell>
          <TableCell className="text-right">₹3,390</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Dec 1, 2024</TableCell>
          <TableCell>Maruti Swift</TableCell>
          <TableCell>32.0L</TableCell>
          <TableCell>₹94.20</TableCell>
          <TableCell className="text-right">₹3,014</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Nov 25, 2024</TableCell>
          <TableCell>BMW 320i</TableCell>
          <TableCell>45.0L</TableCell>
          <TableCell>₹95.00</TableCell>
          <TableCell className="text-right">₹4,275</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Table>
      <TableCaption>Fuel logs with action buttons.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox />
          </TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Car</TableHead>
          <TableHead>Fuel Amount</TableHead>
          <TableHead>Price/L</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Checkbox />
          </TableCell>
          <TableCell className="font-medium">Dec 7, 2024</TableCell>
          <TableCell>Honda City</TableCell>
          <TableCell>35.5L</TableCell>
          <TableCell>₹95.50</TableCell>
          <TableCell className="text-right">₹3,390</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Checkbox />
          </TableCell>
          <TableCell className="font-medium">Dec 1, 2024</TableCell>
          <TableCell>Maruti Swift</TableCell>
          <TableCell>32.0L</TableCell>
          <TableCell>₹94.20</TableCell>
          <TableCell className="text-right">₹3,014</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <Table>
      <TableCaption>Car performance with status badges.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Car</TableHead>
          <TableHead>Registration</TableHead>
          <TableHead>Fuel Type</TableHead>
          <TableHead>Efficiency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total Distance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Honda City</TableCell>
          <TableCell>KA-01-AB-1234</TableCell>
          <TableCell>
            <Badge variant="secondary">Petrol</Badge>
          </TableCell>
          <TableCell>18.5 km/L</TableCell>
          <TableCell>
            <Badge variant="default">Active</Badge>
          </TableCell>
          <TableCell className="text-right">15,000 km</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Maruti Swift</TableCell>
          <TableCell>TN-09-BC-5678</TableCell>
          <TableCell>
            <Badge variant="secondary">Petrol</Badge>
          </TableCell>
          <TableCell>22.8 km/L</TableCell>
          <TableCell>
            <Badge variant="default">Active</Badge>
          </TableCell>
          <TableCell className="text-right">12,500 km</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">BMW 320i</TableCell>
          <TableCell>DL-01-CD-9999</TableCell>
          <TableCell>
            <Badge variant="outline">Premium</Badge>
          </TableCell>
          <TableCell>12.5 km/L</TableCell>
          <TableCell>
            <Badge variant="destructive">Inactive</Badge>
          </TableCell>
          <TableCell className="text-right">8,000 km</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableCaption>Monthly fuel consumption summary.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Total Distance</TableHead>
          <TableHead>Fuel Used</TableHead>
          <TableHead>Average Efficiency</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">December 2024</TableCell>
          <TableCell>1,200 km</TableCell>
          <TableCell>65L</TableCell>
          <TableCell>18.5 km/L</TableCell>
          <TableCell className="text-right">₹6,175</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">November 2024</TableCell>
          <TableCell>1,150 km</TableCell>
          <TableCell>62L</TableCell>
          <TableCell>18.5 km/L</TableCell>
          <TableCell className="text-right">₹5,890</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">October 2024</TableCell>
          <TableCell>1,300 km</TableCell>
          <TableCell>70L</TableCell>
          <TableCell>18.6 km/L</TableCell>
          <TableCell className="text-right">₹6,650</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4} className="font-medium">Total</TableCell>
          <TableCell className="text-right font-medium">₹18,715</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Compact: Story = {
  render: () => (
    <Table>
      <TableCaption>Compact fuel log entries.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Date</TableHead>
          <TableHead>Car</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-xs">12/07</TableCell>
          <TableCell className="text-sm">Honda City</TableCell>
          <TableCell className="text-sm">35.5L</TableCell>
          <TableCell className="text-sm">₹95.50</TableCell>
          <TableCell className="text-right text-sm">₹3,390</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-xs">12/01</TableCell>
          <TableCell className="text-sm">Maruti Swift</TableCell>
          <TableCell className="text-sm">32.0L</TableCell>
          <TableCell className="text-sm">₹94.20</TableCell>
          <TableCell className="text-right text-sm">₹3,014</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-xs">11/25</TableCell>
          <TableCell className="text-sm">BMW 320i</TableCell>
          <TableCell className="text-sm">45.0L</TableCell>
          <TableCell className="text-sm">₹95.00</TableCell>
          <TableCell className="text-right text-sm">₹4,275</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableCaption>No fuel logs found.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Car</TableHead>
          <TableHead>Fuel Amount</TableHead>
          <TableHead>Price/L</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
            No fuel logs recorded yet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Loading: Story = {
  render: () => (
    <Table>
      <TableCaption>Loading fuel logs...</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Car</TableHead>
          <TableHead>Fuel Amount</TableHead>
          <TableHead>Price/L</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

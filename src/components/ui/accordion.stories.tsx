import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, Fuel, Settings, Bell, Car } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FuelLogSettings: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-lg">
      <AccordionItem value="car-settings">
        <AccordionTrigger className="flex items-center gap-2">
          <Car className="w-4 h-4" />
          Car Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>Manage your car information, fuel type, and tank capacity.</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Update car details</li>
              <li>• Set fuel preferences</li>
              <li>• Configure tank capacity</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="fuel-settings">
        <AccordionTrigger className="flex items-center gap-2">
          <Fuel className="w-4 h-4" />
          Fuel Log Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>Configure how fuel logs are recorded and displayed.</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set default fuel type</li>
              <li>• Configure price alerts</li>
              <li>• Set reminder intervals</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="notifications">
        <AccordionTrigger className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>Manage your notification preferences.</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Fuel price alerts</li>
              <li>• Maintenance reminders</li>
              <li>• Sync status updates</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>
          This is the first item content. Multiple items can be open at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          This is the second item content. You can have multiple items expanded simultaneously.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>
          This is the third item content. All items can be open or closed independently.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1" className="border-2 border-primary/20 rounded-lg mb-2">
        <AccordionTrigger className="hover:no-underline px-4 py-3 bg-primary/5 rounded-t-lg">
          Custom Styled Item
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 bg-primary/5 rounded-b-lg">
          This accordion item has custom styling with primary color theme.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-2 border-secondary/20 rounded-lg">
        <AccordionTrigger className="hover:no-underline px-4 py-3 bg-secondary/5 rounded-t-lg">
          Another Custom Item
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 bg-secondary/5 rounded-b-lg">
          This item uses secondary color theme for styling.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

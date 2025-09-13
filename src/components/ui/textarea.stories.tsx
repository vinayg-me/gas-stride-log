import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Label } from './label';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    rows: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is a pre-filled textarea with some content.',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
  },
};

export const CustomRows: Story = {
  args: {
    placeholder: 'This textarea has 6 rows',
    rows: 6,
  },
};

export const FuelLogNotes: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="notes">Fuel Log Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add any notes about this fuel fill (e.g., driving conditions, maintenance, etc.)"
        rows={4}
      />
    </div>
  ),
};

export const CarDescription: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="description">Car Description</Label>
      <Textarea
        id="description"
        placeholder="Describe your car, any modifications, or special features..."
        rows={3}
      />
    </div>
  ),
};

export const Feedback: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="feedback">Feedback</Label>
      <Textarea
        id="feedback"
        placeholder="Please share your feedback about the app..."
        rows={5}
      />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="error-textarea" className="text-destructive">
        Notes
      </Label>
      <Textarea
        id="error-textarea"
        placeholder="This textarea has an error state"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">This field is required.</p>
    </div>
  ),
};

export const ResizeDisabled: Story = {
  args: {
    placeholder: 'This textarea cannot be resized',
    className: 'resize-none',
  },
};

export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    const maxLength = 200;
    
    return (
      <div className="space-y-2 w-80">
        <Label htmlFor="limited-textarea">Limited Textarea</Label>
        <Textarea
          id="limited-textarea"
          placeholder="Type up to 200 characters..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          rows={4}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{value.length}/{maxLength} characters</span>
          <span>{maxLength - value.length} remaining</span>
        </div>
      </div>
    );
  },
};

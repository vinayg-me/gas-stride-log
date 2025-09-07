# FuelTrackr Storybook

This directory contains Storybook stories for FuelTrackr components following the CRED-inspired design system.

## Getting Started

Run Storybook in development mode:

```bash
npm run storybook
```

Build Storybook for production:

```bash
npm run build-storybook
```

## Component Stories

### UI Components

- **StatCard** - Statistics display cards with CRED-style glassmorphism
- **CarCard** - Car information cards with stats and actions
- **FloatingActionButton** - Animated FAB for primary actions
- **Button** - All button variants (default, secondary, outline, etc.)
- **LoadingSpinner** - Loading states in different sizes

### Design Tokens

All stories use the same design system tokens from:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme configuration

### Dark Theme

Storybook is configured to default to the dark theme to match the CRED-inspired design. The preview decorator applies the `dark` class to all stories.

## Story Structure

Each story file follows this pattern:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './component-name';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'fullscreen'
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## Adding New Stories

1. Create a new `.stories.tsx` file next to your component
2. Follow the naming convention: `component-name.stories.tsx`
3. Use TypeScript for better type safety
4. Include multiple variants to showcase component flexibility
5. Add meaningful story names and descriptions

## Visual Testing

Stories are designed to be visual regression testing friendly. Consider using tools like Chromatic for automated visual testing of components.
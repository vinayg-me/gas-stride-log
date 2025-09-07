# FuelTrackr Storybook Configuration

This directory contains the Storybook configuration for the FuelTrackr design system.

## Configuration Files

- `main.ts` - Main Storybook configuration
- `preview.ts` - Global decorators and parameters
- `manager.ts` - Storybook UI theme configuration
- `vite.config.ts` - Vite configuration for Storybook

## Features

- **Dark Theme**: Matches FuelTrackr's CRED-inspired design
- **TypeScript Support**: Full type safety for stories
- **Tailwind CSS**: Integrated with your existing Tailwind setup
- **Framer Motion**: Animation support in stories
- **React Query**: Data fetching simulation in stories
- **Component Documentation**: Auto-generated docs from TypeScript

## Available Scripts

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook for production
pnpm build-storybook
```

## Story Structure

Stories are located in `src/components/ui/*.stories.tsx` and follow this pattern:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './component-name';

const meta = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
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

1. Create a `.stories.tsx` file next to your component
2. Follow the naming convention: `component-name.stories.tsx`
3. Use TypeScript for better type safety
4. Include multiple variants to showcase component flexibility
5. Add meaningful story names and descriptions

## Design System Integration

All stories use the same design tokens from:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme configuration
- `src/lib/utils.ts` - Utility functions

The preview decorator applies the `dark` class to all stories to match the CRED-inspired design.

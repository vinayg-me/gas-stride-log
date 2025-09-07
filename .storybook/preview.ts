import type { Preview } from '@storybook/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/index.css';

// Create a new QueryClient for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: 'hsl(240, 10%, 3.9%)', // background color from your theme
        },
        {
          name: 'light',
          value: 'hsl(0, 0%, 100%)',
        },
      ],
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        'div',
        { className: 'dark' },
        React.createElement(Story)
      )
    ),
  ],
};

export default preview;
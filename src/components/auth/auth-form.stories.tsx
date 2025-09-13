import type { Meta, StoryObj } from '@storybook/react';
import { AuthForm } from './auth-form';
import { AuthProvider } from '@/contexts/auth-context';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  title: 'Auth/AuthForm',
  component: AuthForm,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default authentication form with sign in and sign up tabs, including social login options.',
      },
    },
  },
};

export const SignUpTab: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Authentication form focused on the sign up tab.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    const signUpTab = canvas.querySelector('[value="signup"]') as HTMLElement;
    if (signUpTab) {
      signUpTab.click();
    }
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Authentication form showing an error state when login fails.',
      },
    },
  },
};

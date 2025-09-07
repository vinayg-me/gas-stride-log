import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: {
    ...themes.dark,
    brandTitle: 'FuelTrackr Storybook',
    brandUrl: './',
    brandImage: undefined,
    brandTarget: '_self',
    
    // Customize the dark theme to match FuelTrackr's design
    colorPrimary: '#8B5CF6', // Primary purple
    colorSecondary: '#3B82F6', // Secondary blue
    
    // UI
    appBg: '#0F0F17', // Background color
    appContentBg: '#171722', // Card background
    appBorderColor: '#262626',
    appBorderRadius: 8,
    
    // Text colors
    textColor: '#ffffff',
    textInverseColor: '#000000',
    textMutedColor: '#a1a1aa',
    
    // Toolbar default and active colors
    barTextColor: '#a1a1aa',
    barSelectedColor: '#8B5CF6',
    barBg: '#171722',
    
    // Form colors
    inputBg: '#171722',
    inputBorder: '#262626',
    inputTextColor: '#ffffff',
    inputBorderRadius: 6,
  },
  panelPosition: 'bottom',
  selectedPanel: 'storybook/controls/panel',
  initialActive: 'sidebar',
  showNav: true,
  showPanel: true,
  showToolbar: true,
  enableShortcuts: true,
  showCanvas: true,
  showTabs: true,
  showCode: true,
});

import React from 'react';
import type { Preview } from '@storybook/react';
import { MockApiProvider } from '../src/testing/mock-api-provider';
import '../src/styles.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MockApiProvider branding={{ productName: 'Storybook' }}>
        <Story />
      </MockApiProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

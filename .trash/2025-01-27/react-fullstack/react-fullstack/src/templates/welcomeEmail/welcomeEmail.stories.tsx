import type { Meta, StoryObj } from '@storybook/react';
import { Template } from './welcomeEmail.component';

const meta: Meta<typeof Template> = {
  title: 'Templates/WelcomeEmail',
  component: Template,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
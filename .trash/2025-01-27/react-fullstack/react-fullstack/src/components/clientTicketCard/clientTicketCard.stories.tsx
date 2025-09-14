import type { Meta, StoryObj } from '@storybook/react';
import { ClientTicketCard } from './clientTicketCard.component';

const meta: Meta<typeof ClientTicketCard> = {
  title: 'Components/ClientTicketCard',
  component: ClientTicketCard,
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
import React from 'react';
import { EmailComponentProps } from '../../types';

export interface WelcomeEmailProps extends EmailComponentProps {
  // Add your props here
}

export const Template: React.FC<WelcomeEmailProps> = (props) => {
  return (
    <div className="email-template welcome-email">
      {/* Email template content */}
    </div>
  );
};
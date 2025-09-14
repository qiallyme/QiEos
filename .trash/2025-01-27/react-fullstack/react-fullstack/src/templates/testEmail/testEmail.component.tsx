import React from 'react';
import { EmailComponentProps } from '../../types';

export interface TestEmailProps extends EmailComponentProps {
  // Add your props here
}

export const Template: React.FC<TestEmailProps> = (props) => {
  return (
    <div className="email-template test-email">
      {/* Email template content */}
    </div>
  );
};
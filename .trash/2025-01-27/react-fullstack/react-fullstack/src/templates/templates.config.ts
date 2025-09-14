import { EmailTemplateDefinition, EmailTemplateType } from '../types';

import * as WelcomeEmail from './welcomeEmail';
import * as TestEmail from './testEmail';
//<-- INJECT EMAIL TEMPLATE IMPORT -->

export const templates: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.WELCOME_EMAIL]: WelcomeEmail,
  [EmailTemplateType.TEST_EMAIL]: TestEmail,
  //<-- INJECT EMAIL TEMPLATE -->
};

import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { environment } from './environment';

export const mailerOptions: MailerOptions = {
  transport: {
    host: environment.apiTransportHost,
    port: environment.apiTransportPort,
    secure: false, // true for 465, false for other ports
    auth: {
      user: environment.apiTransportUser,
      pass: environment.apiTransportPassword,
    },
  },
  defaults: {
    from: environment.apiTransportFrom, // outgoing email ID
  },
  preview: environment.nodeEnv !== 'production', // preview email in browser, dev only
  template: {
    dir: `${process.cwd()}/templates`,
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};

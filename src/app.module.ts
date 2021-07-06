import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { mailerOptions } from './mailerconfig';
import * as connectionOptions from './ormconfig';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(connectionOptions),
    MailerModule.forRoot(mailerOptions),
    AccountsModule,
    AuthModule,
    UploadsModule,
  ],
})
export class AppModule {}

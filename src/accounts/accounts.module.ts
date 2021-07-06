import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Upload } from '../uploads/entities/upload.entity';
import { UploadsService } from '../uploads/uploads.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Upload])],
  controllers: [AccountsController],
  providers: [AccountsService, UploadsService],
})
export class AccountsModule {}

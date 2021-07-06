import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { environment } from '../environment';
import { Upload } from '../uploads/entities/upload.entity';
import { UploadsService } from '../uploads/uploads.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Upload]),
    JwtModule.register({
      secret: environment.apiUserJwtSecret,
      signOptions: {
        expiresIn: environment.apiUserJwtExpirationTime,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccountsService,
    UploadsService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}

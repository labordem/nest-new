import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { environment } from '../environment';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    JwtModule.register({
      secret: environment.apiUserJwtSecret,
      signOptions: {
        expiresIn: environment.apiUserJwtExpirationTime,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountsService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}

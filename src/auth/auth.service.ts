import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { verify as compare } from 'argon2';
import { sign, verify } from 'jsonwebtoken';

import { Account, Role } from '../accounts/entities/account.entity';
import { environment } from '../environment';
import { RegisterDto } from './dto/register.dto';

export interface UserJwtPayload {
  id: number;
  email: string;
  roles: Role[];
}

export interface EmailJwtPayload {
  email: string;
}

export interface ForgotPasswordJwtPayload {
  id: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly mailerService: MailerService) {}

  async isPasswordCorrect(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return compare(hashedPassword, plainPassword);
  }

  async sendConfirmationEmail(
    account: RegisterDto | Account,
    emailToken: string,
  ): Promise<unknown> {
    const confirmEmailUrl = `${environment.pwaConfirmEmailUrl}/${emailToken}`;

    return this.mailerService.sendMail({
      to: account.email,
      subject: `${environment.projectName} - Confirm your email`,
      template: 'confirm-email',
      context: {
        firstName: account.firstName,
        lastName: account.lastName,
        projectName: environment.projectName,
        confirmEmailUrl,
      },
    });
  }

  async sendResetPasswordEmail(
    account: Account,
    emailToken: string,
  ): Promise<unknown> {
    const resetPasswordUrl = `${environment.pwaResetPasswordUrl}/${account.id}/${emailToken}`;

    return this.mailerService.sendMail({
      to: account.email,
      subject: `${environment.projectName} - Reset your password`,
      template: 'reset-password',
      context: {
        firstName: account.firstName,
        lastName: account.lastName,
        projectName: environment.projectName,
        resetPasswordUrl,
      },
    });
  }

  async sendPasswordChangedEmail(account: Account): Promise<unknown> {
    return this.mailerService.sendMail({
      to: account.email,
      subject: `${environment.projectName} - Password changed`,
      template: 'password-changed',
      context: {
        firstName: account.firstName,
        lastName: account.lastName,
        projectName: environment.projectName,
      },
    });
  }

  createUserToken(account: Account): string {
    const payload: UserJwtPayload = {
      id: account.id,
      email: account.email,
      roles: account.roles,
    };
    return sign(payload, environment.apiUserJwtKey, {
      expiresIn: '7d',
    });
  }

  createEmailToken(email: string): string {
    const payload: EmailJwtPayload = { email };
    return sign(payload, environment.apiEmailJwtKey, {
      expiresIn: '15m',
    });
  }

  createForgotPasswordToken(account: Account): string {
    const payload: ForgotPasswordJwtPayload = { id: account.id };
    const createdAtString = account.createdAt.toISOString();
    const secret = `${account.password}-${createdAtString}`;

    return sign(payload, secret, {
      expiresIn: '15m',
    });
  }

  getPayloadFromForgotPasswordToken(
    account: Account,
    token: string,
  ): ForgotPasswordJwtPayload {
    const createdAtString = account.createdAt.toISOString();
    const secret = `${account.password}-${createdAtString}`;

    return verify(token, secret) as ForgotPasswordJwtPayload;
  }

  getPayloadFromToken(
    token: string,
    type: 'user' | 'email',
  ): UserJwtPayload | EmailJwtPayload {
    const secret =
      type === 'user' ? environment.apiUserJwtKey : environment.apiEmailJwtKey;

    return verify(token, secret) as UserJwtPayload | EmailJwtPayload;
  }
}

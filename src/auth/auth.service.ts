import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { verify as compare } from 'argon2';
import { sign, verify } from 'jsonwebtoken';

import { AccountsService } from '../accounts/accounts.service';
import { CreateAccountDto } from '../accounts/dto/create-account.dto';
import { Account } from '../accounts/entities/account.entity';
import { ProcessedDto } from '../common/dto/processed.dto';
import { environment } from '../environment';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  EmailJwtPayload,
  ForgotPasswordJwtPayload,
  UserJwtPayload,
} from './models/jwt-payload.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly accountsService: AccountsService,
  ) {}

  async login(loginDto: LoginDto): Promise<Account> {
    const accountWithPassword = await this.accountsService.findOneByEmail(
      loginDto.email,
      true,
    );
    if (!accountWithPassword) {
      throw new UnauthorizedException('Invalid email');
    }
    const isPasswordCorrect = await this.isPasswordCorrect(
      accountWithPassword.password,
      loginDto.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid password');
    }
    const { password, ...account } = accountWithPassword;

    return account as Account;
  }

  async register(createAccountDto: CreateAccountDto): Promise<Account> {
    // TODO: Prevent an attacker from listing existing e-mail addresses
    const foundAccount = await this.accountsService.findOneByEmail(
      createAccountDto.email,
    );
    if (foundAccount) {
      throw new BadRequestException('Email already exists');
    }
    const account = await this.accountsService.create(createAccountDto);
    void this.sendConfirmationEmail(account);

    return account;
  }

  async resendConfirmationEmail(email: string): Promise<ProcessedDto> {
    const account = await this.accountsService.findOneByEmail(email);
    if (account) {
      void this.sendConfirmationEmail(account);
    }

    return { isProcessed: true };
  }

  async confirmEmail(emailToken: string): Promise<Account> {
    const payload = this.getPayloadFromEmailToken(emailToken);
    const account = await this.accountsService.findOneByEmail(payload.email);
    if (!account) {
      throw new UnauthorizedException('Invalid email');
    }
    if (account.isConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    const confirmedAccount = await this.accountsService.update(account.id, {
      ...account,
      isConfirmed: true,
    } as Account);

    return confirmedAccount;
  }

  async forgotPassword(email: string): Promise<ProcessedDto> {
    const accountWithPassword = await this.accountsService.findOneByEmail(
      email,
      true,
    );
    if (!accountWithPassword) {
      throw new UnauthorizedException('Invalid email');
    }
    void this.sendResetPasswordEmail(accountWithPassword);

    return { isProcessed: true };
  }

  async resetPassword(
    id: number,
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<Account> {
    const accountWithPassword = await this.accountsService.findOneById(
      id,
      true,
    );
    if (!accountWithPassword) {
      throw new NotFoundException('Account not found');
    }
    this.getPayloadFromForgotPasswordToken(accountWithPassword, token);
    const isSamePassword = await this.isPasswordCorrect(
      accountWithPassword.password,
      resetPasswordDto.newPassword,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current',
      );
    }
    const account = await this.accountsService.updatePassword(
      accountWithPassword.id,
      resetPasswordDto.newPassword,
    );
    void this.sendPasswordChangedEmail(account);

    return account;
  }

  createUserToken(account: Account): string {
    const payload: UserJwtPayload = {
      id: account.id,
      email: account.email,
      roles: account.roles,
      isConfirmed: account.isConfirmed,
    };
    return sign(payload, environment.apiUserJwtSecret, {
      expiresIn: environment.apiUserJwtExpirationTime,
    });
  }

  private getPayloadFromForgotPasswordToken(
    accountWithPassword: Account,
    token: string,
  ): ForgotPasswordJwtPayload {
    const createdAtString = accountWithPassword.createdAt.toISOString();
    const secret = `${accountWithPassword.password}-${createdAtString}`;

    return verify(token, secret) as ForgotPasswordJwtPayload;
  }

  private getPayloadFromEmailToken(token: string): EmailJwtPayload {
    const secret = environment.apiEmailJwtSecret;

    return verify(token, secret) as EmailJwtPayload;
  }

  private isPasswordCorrect(
    hashedPassword: string,
    plainTextPassword: string,
  ): Promise<boolean> {
    return compare(hashedPassword, plainTextPassword);
  }

  private createConfirmEmailToken(account: Account): string {
    const payload: EmailJwtPayload = { email: account.email };
    return sign(payload, environment.apiEmailJwtSecret, {
      expiresIn: environment.apiEmailJwtExpirationTime,
    });
  }

  private createResetPasswordToken(accountWithPassword: Account): string {
    const payload: ForgotPasswordJwtPayload = { id: accountWithPassword.id };
    const createdAtString = accountWithPassword.createdAt.toISOString();
    const secret = `${accountWithPassword.password}-${createdAtString}`;

    return sign(payload, secret, {
      expiresIn: environment.apiEmailJwtExpirationTime,
    });
  }

  private async sendConfirmationEmail(account: Account): Promise<ProcessedDto> {
    const emailToken = this.createConfirmEmailToken(account);
    const confirmEmailUrl = `${environment.pwaConfirmEmailUrl}/${emailToken}`;
    const { accepted } = (await this.mailerService.sendMail({
      to: account.email,
      subject: `${environment.projectName} - Confirm your email`,
      template: 'confirm-email',
      context: {
        firstName: account.firstName,
        lastName: account.lastName,
        projectName: environment.projectName,
        confirmEmailUrl,
      },
    })) as { accepted: string[] };

    return { isProcessed: !!accepted };
  }

  private async sendResetPasswordEmail(
    accountWithPassword: Account,
  ): Promise<ProcessedDto> {
    const emailToken = this.createResetPasswordToken(accountWithPassword);
    const resetPasswordUrl = `${environment.pwaResetPasswordUrl}/${accountWithPassword.id}/${emailToken}`;
    const { accepted } = (await this.mailerService.sendMail({
      to: accountWithPassword.email,
      subject: `${environment.projectName} - Reset your password`,
      template: 'reset-password',
      context: {
        firstName: accountWithPassword.firstName,
        lastName: accountWithPassword.lastName,
        projectName: environment.projectName,
        resetPasswordUrl,
      },
    })) as { accepted: string[] };

    return { isProcessed: !!accepted };
  }

  private async sendPasswordChangedEmail(
    account: Account,
  ): Promise<ProcessedDto> {
    const { accepted } = (await this.mailerService.sendMail({
      to: account.email,
      subject: `${environment.projectName} - Password changed`,
      template: 'password-changed',
      context: {
        firstName: account.firstName,
        lastName: account.lastName,
        projectName: environment.projectName,
      },
    })) as { accepted: string[] };

    return { isProcessed: !!accepted };
  }
}

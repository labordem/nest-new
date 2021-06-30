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
    const accountWithCredentials = await this.accountsService.findOneByEmail(
      loginDto.email,
      true,
    );
    if (!accountWithCredentials) {
      throw new UnauthorizedException('Invalid email');
    }
    const isPasswordCorrect = await this.isPasswordCorrect(
      accountWithCredentials.password,
      loginDto.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid password');
    }
    const { password, email, ...account } = accountWithCredentials;

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
    void this.sendConfirmationEmail(createAccountDto.email, account);

    return account;
  }

  async resendConfirmationEmail(email: string): Promise<ProcessedDto> {
    const account = await this.accountsService.findOneByEmail(email);
    if (account) {
      void this.sendConfirmationEmail(email, account);
    }

    return { isProcessed: true };
  }

  async confirmEmail(emailToken: string): Promise<Account> {
    const payload = this.getPayloadFromEmailToken(emailToken);
    const account = await this.accountsService.findOneById(payload.id);
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
    const accountWithCredentials = await this.accountsService.findOneByEmail(
      email,
      true,
    );
    if (!accountWithCredentials) {
      throw new UnauthorizedException('Invalid email');
    }
    void this.sendResetPasswordEmail(accountWithCredentials);

    return { isProcessed: true };
  }

  async resetPassword(
    id: number,
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<Account> {
    const accountWithCredentials = await this.accountsService.findOneById(
      id,
      true,
    );
    if (!accountWithCredentials) {
      throw new NotFoundException('Account not found');
    }
    this.getPayloadFromForgotPasswordToken(accountWithCredentials, token);
    const isSamePassword = await this.isPasswordCorrect(
      accountWithCredentials.password,
      resetPasswordDto.newPassword,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current',
      );
    }
    const { email } = accountWithCredentials;
    const account = await this.accountsService.updatePassword(
      accountWithCredentials.id,
      resetPasswordDto.newPassword,
    );
    void this.sendPasswordChangedEmail(email, account);

    return account;
  }

  createUserToken(account: Account): string {
    const payload: UserJwtPayload = {
      id: account.id,
      createdAt: account.createdAt,
      roles: account.roles,
      isConfirmed: account.isConfirmed,
    };
    return sign(payload, environment.apiUserJwtSecret, {
      expiresIn: environment.apiUserJwtExpirationTime,
    });
  }

  private getPayloadFromForgotPasswordToken(
    accountWithCredentials: Account,
    token: string,
  ): ForgotPasswordJwtPayload {
    const createdAtString = accountWithCredentials.createdAt.toISOString();
    const secret = `${accountWithCredentials.password}-${createdAtString}`;

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
    const payload: EmailJwtPayload = {
      id: account.id,
      createdAt: account.createdAt,
    };
    return sign(payload, environment.apiEmailJwtSecret, {
      expiresIn: environment.apiEmailJwtExpirationTime,
    });
  }

  private createResetPasswordToken(accountWithCredentials: Account): string {
    const payload: ForgotPasswordJwtPayload = {
      id: accountWithCredentials.id,
      createdAt: accountWithCredentials.createdAt,
    };
    const createdAtString = accountWithCredentials.createdAt.toISOString();
    const secret = `${accountWithCredentials.password}-${createdAtString}`;

    return sign(payload, secret, {
      expiresIn: environment.apiEmailJwtExpirationTime,
    });
  }

  private async sendConfirmationEmail(
    email: string,
    account: Account,
  ): Promise<ProcessedDto> {
    const emailToken = this.createConfirmEmailToken(account);
    const confirmEmailUrl = `${environment.pwaConfirmEmailUrl}/${emailToken}`;
    const { accepted } = (await this.mailerService.sendMail({
      to: email,
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
    accountWithCredentials: Account,
  ): Promise<ProcessedDto> {
    const emailToken = this.createResetPasswordToken(accountWithCredentials);
    const resetPasswordUrl = `${environment.pwaResetPasswordUrl}/${accountWithCredentials.id}/${emailToken}`;
    const { accepted } = (await this.mailerService.sendMail({
      to: accountWithCredentials.email,
      subject: `${environment.projectName} - Reset your password`,
      template: 'reset-password',
      context: {
        firstName: accountWithCredentials.firstName,
        lastName: accountWithCredentials.lastName,
        projectName: environment.projectName,
        resetPasswordUrl,
      },
    })) as { accepted: string[] };

    return { isProcessed: !!accepted };
  }

  private async sendPasswordChangedEmail(
    email: string,
    account: Account,
  ): Promise<ProcessedDto> {
    const { accepted } = (await this.mailerService.sendMail({
      to: email,
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

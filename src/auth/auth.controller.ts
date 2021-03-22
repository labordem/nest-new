import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { ProcessedDto } from '../common/dto/processed.dto';
import { AuthService } from './auth.service';
import { LoggedInUserDto } from './dto/logged-in-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountsService: AccountsService,
  ) {}

  /** Login a user */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoggedInUserDto> {
    const accountWithPassword = await this.accountsService.findByEmail(
      loginDto.email,
      true,
    );
    if (!accountWithPassword) {
      throw new UnauthorizedException('Invalid email');
    }
    const isPasswordCorrect = await this.authService.isPasswordCorrect(
      accountWithPassword.password,
      loginDto.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid password');
    }
    const { password, ...accountWithoutPassword } = accountWithPassword;
    const userToken = this.authService.createUserToken(
      accountWithoutPassword as Account,
    );

    return {
      jwt: userToken,
      account: accountWithoutPassword as Account,
    };
  }

  /** Register a user */
  @Post('register')
  async register(
    @Body() createAccountDto: RegisterDto,
  ): Promise<LoggedInUserDto> {
    const account = await this.accountsService.findByEmail(
      createAccountDto.email,
    );
    if (account) {
      throw new BadRequestException('Email already exists');
    }
    const createdAccount = await this.accountsService.create(createAccountDto);
    const userToken = this.authService.createUserToken(createdAccount);
    const emailToken = this.authService.createEmailToken(createdAccount.email);
    void this.authService.sendConfirmationEmail(createAccountDto, emailToken);

    return {
      jwt: userToken,
      account: createdAccount,
    };
  }

  /** Request a new confirmation email */
  @Get('resend-confirmation-email/:email')
  async resendConfirmationEmail(
    @Param('email') email: string,
  ): Promise<ProcessedDto> {
    // tester si fait pas trop souvent

    const account = await this.accountsService.findByEmail(email);
    if (account) {
      const emailToken = this.authService.createEmailToken(email);
      void this.authService.sendConfirmationEmail(account, emailToken);
    }
    // End user should not know if email exists
    return { isProcessed: true };
  }

  /** Confirm a user with his email token */
  @Get('confirm-email/:token')
  async confirmEmail(@Param('token') token: string): Promise<LoggedInUserDto> {
    const payload = this.authService.getPayloadFromToken(token, 'email');
    const account = await this.accountsService.findByEmail(payload.email);
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
    const userToken = this.authService.createUserToken(confirmedAccount);

    return {
      jwt: userToken,
      account: confirmedAccount,
    };
  }

  /** Send an email containing a token allowing an user to change his password */
  @Get('forgot-password/:email')
  async sendEmailForgotPassword(
    @Param('email') email: string,
  ): Promise<ProcessedDto> {
    const account = await this.accountsService.findByEmail(email, true);
    if (account) {
      const emailToken = this.authService.createForgotPasswordToken(account);
      void this.authService.sendResetPasswordEmail(account, emailToken);
    }
    // End user should not know if email exists
    return { isProcessed: true };
  }

  @Post('reset-password/:id/:token')
  async resetPassword(
    @Param('id') id: number,
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<unknown> {
    const account = await this.accountsService.findOne(id, true);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const payload = this.authService.getPayloadFromForgotPasswordToken(
      account,
      token,
    );
    if (!payload) {
      throw new InternalServerErrorException('Server error');
    }
    const isSamePassword = await this.authService.isPasswordCorrect(
      account.password,
      resetPasswordDto.newPassword,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current',
      );
    }
    await this.accountsService.updatePassword(
      account.id,
      resetPasswordDto.newPassword,
    );
    void this.authService.sendPasswordChangedEmail(account);

    return { success: true };
  }
}
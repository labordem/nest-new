import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { Account } from '../accounts/entities/account.entity';
import { ProcessedDto } from '../common/dto/processed.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoggedInUserDto } from './dto/logged-in-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithAccount } from './models/request-with-account.model';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Get an Account with email/password implicit body */
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  async login(@Req() request: RequestWithAccount): Promise<LoggedInUserDto> {
    const account = request.user;
    const jwt = this.authService.createUserToken(account);

    return { jwt, account };
  }

  /** Create an Account and send an email containing a token allowing an user to confirm his email */
  @Post('register')
  async register(
    @Body() createAccountDto: RegisterDto,
  ): Promise<LoggedInUserDto> {
    const account = await this.authService.register(createAccountDto);
    const jwt = this.authService.createUserToken(account);

    return { jwt, account };
  }

  /** Send an email containing a token allowing an user to confirm his email */
  @Get('resend-confirmation-email/:email')
  async resendConfirmationEmail(
    @Param('email') email: string,
  ): Promise<ProcessedDto> {
    void this.authService.resendConfirmationEmail(email);

    return { isProcessed: true };
  }

  /** Confirm a user with his email token */
  @Get('confirm-email/:token')
  async confirmEmail(@Param('token') token: string): Promise<LoggedInUserDto> {
    const account = await this.authService.confirmEmail(token);
    const jwt = this.authService.createUserToken(account);

    return { jwt, account };
  }

  /** Send an email containing a token allowing an user to change his password */
  @Get('forgot-password/:email')
  async sendEmailForgotPassword(
    @Param('email') email: string,
  ): Promise<ProcessedDto> {
    return this.authService.forgotPassword(email);
  }

  /** Reset an account password and send an email to user to warn that his password has been changed */
  @Post('reset-password/:id/:token')
  async resetPassword(
    @Param('id') id: number,
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<Account> {
    return this.authService.resetPassword(id, token, resetPasswordDto);
  }
}

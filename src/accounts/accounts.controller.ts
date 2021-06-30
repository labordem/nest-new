import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';

import { Roles } from '../auth/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, Role } from './entities/account.entity';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles(Role.Admin)
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll(): Promise<Account[]> {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin)
  findOne(@Param('id') id: number): Promise<Account | undefined> {
    return this.accountsService.findOneById(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.accountsService.delete(id);
  }
}

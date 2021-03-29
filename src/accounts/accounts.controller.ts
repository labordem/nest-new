import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';

import { Roles } from '../common/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, Role } from './entities/account.entity';

@ApiTags('accounts')
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  findAll(): Promise<Account[]> {
    return this.accountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Account | undefined> {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.accountsService.delete(id);
  }
}

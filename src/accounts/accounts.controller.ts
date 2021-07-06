import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';

import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ProcessedDto } from '../common/dto/processed.dto';
import { multerConfig } from '../uploads/configs/multer.config';
import { ApiFile } from '../uploads/decorators/api-file.decorator';
import { Upload } from '../uploads/entities/upload.entity';
import { UploadCategoryName } from '../uploads/models/upload-category.model';
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

  /** Upload an Account avatar, you must be the Account owner */
  @Post(':id/avatar')
  @Roles(Role.User)
  @ApiFile('file')
  @UseInterceptors(
    FileInterceptor('file', multerConfig(UploadCategoryName.Avatar)),
  )
  uploadAvatar(
    @User() account: Account,
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Upload> {
    const isOwner = account.id === id;
    if (!isOwner) {
      throw new ForbiddenException('You must be owner');
    }

    return this.accountsService.updateAvatar(id, file);
  }

  /** Delete an Account avatar, you must be the Account owner */
  @Delete(':id/avatar')
  @Roles(Role.User)
  deleteAvatar(
    @User() account: Account,
    @Param('id') id: number,
  ): Promise<ProcessedDto> {
    const isOwner = account.id === +id;
    if (!isOwner) {
      throw new ForbiddenException('You must be owner');
    }

    return this.accountsService.deleteAvatar(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { DeleteResult, Repository } from 'typeorm';

import { ProcessedDto } from '../common/dto/processed.dto';
import { environment } from '../environment';
import { Upload } from '../uploads/entities/upload.entity';
import { UploadCategoryName } from '../uploads/models/upload-category.model';
import { UploadsService } from '../uploads/uploads.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, Role } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly uploadsService: UploadsService,
  ) {}

  /** Create an user Account or an admin Account if admin email is used. */
  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const createdAccount = this.accountRepository.create(createAccountDto);
    if (createAccountDto.email === environment.apiAdminEmail) {
      createdAccount.roles = [Role.Admin];
      createdAccount.isConfirmed = true;
    }
    const accountWithCredentials = await this.accountRepository.save(
      createdAccount,
    );
    const { password, email, ...account } = accountWithCredentials;

    return account as Account;
  }

  /** @param withCredentials WARNING ! Never return password or email. */
  async findOneById(
    id: number,
    withCredentials = false,
  ): Promise<Account | undefined> {
    return this.accountRepository
      .createQueryBuilder('account')
      .where('account.id = :id', { id })
      .addSelect(withCredentials ? 'account.password' : '')
      .addSelect(withCredentials ? 'account.email' : '')
      .leftJoinAndSelect('account.avatar', 'avatar')
      .getOne();
  }

  /** @param withCredentials WARNING ! Never return password or email. */
  async findOneByEmail(
    email: string,
    withCredentials = false,
  ): Promise<Account | undefined> {
    return this.accountRepository
      .createQueryBuilder('account')
      .where('LOWER(account.email) = LOWER(:email)', { email })
      .addSelect(withCredentials ? 'account.password' : '')
      .addSelect(withCredentials ? 'account.email' : '')
      .leftJoinAndSelect('account.avatar', 'avatar')
      .getOne();
  }

  findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const toUpdate = await this.accountRepository.findOneOrFail(id);
    const updatedAccount = { ...toUpdate, ...updateAccountDto };
    const accountWithCredentials = await this.accountRepository.save(
      updatedAccount,
    );
    const { password, email, ...account } = accountWithCredentials;

    return account as Account;
  }

  delete(id: number): Promise<DeleteResult> {
    return this.accountRepository.delete({ id });
  }

  async updatePassword(id: number, newPassword: string): Promise<Account> {
    const toUpdate = await this.accountRepository.findOneOrFail(id);
    const updatedAccount = {
      ...toUpdate,
      isConfirmed: true,
      password: await hash(newPassword),
    } as Account;
    const accountWithCredentials = await this.accountRepository.save(
      updatedAccount,
    );
    const { password, email, ...account } = accountWithCredentials;

    return account as Account;
  }

  async updateAvatar(id: number, file: Express.Multer.File): Promise<Upload> {
    const avatar = await this.uploadsService.create(
      file,
      UploadCategoryName.Avatar,
    );
    const toUpdate = await this.accountRepository.findOneOrFail(id);
    const updatedAccount = { ...toUpdate, avatar };
    const accountWithPassword = await this.accountRepository.save(
      updatedAccount,
    );
    const { password, ...account } = accountWithPassword;
    const previousAvatar = toUpdate.avatar;
    if (previousAvatar) {
      void this.uploadsService.delete(previousAvatar.id);
    }

    return account.avatar;
  }

  async deleteAvatar(id: number): Promise<ProcessedDto> {
    const toUpdate = await this.accountRepository.findOneOrFail(id);
    const avatar = toUpdate?.avatar;
    await this.accountRepository.update(id, {
      avatar: undefined,
    });
    if (avatar) {
      void this.uploadsService.delete(avatar.id);
    }

    return { isProcessed: true };
  }
}

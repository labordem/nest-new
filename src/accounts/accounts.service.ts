import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { DeleteResult, Repository } from 'typeorm';

import { environment } from '../environment';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, Role } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
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
}

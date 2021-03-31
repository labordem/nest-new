import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { DeleteResult, Repository } from 'typeorm';

import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const createdAccount = this.accountRepository.create(createAccountDto);
    const accountWithPassword = await this.accountRepository.save(
      createdAccount,
    );
    const { password, ...account } = accountWithPassword;

    return account as Account;
  }

  findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  /** @param withHashedPassword WARNING ! Never return a password to end user, even hashed */
  async findOne(
    id: number,
    withHashedPassword = false,
  ): Promise<Account | undefined> {
    return this.accountRepository
      .createQueryBuilder('account')
      .where('account.id = :id', { id })
      .addSelect(withHashedPassword ? 'account.password' : '')
      .getOne();
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const toUpdate = await this.accountRepository.findOne(id);
    if (!toUpdate) {
      throw new NotFoundException(`Account #${id} not found`);
    }
    const updatedAccount = { ...toUpdate, ...updateAccountDto };
    const accountWithPassword = await this.accountRepository.save(
      updatedAccount,
    );
    const { password, ...account } = accountWithPassword;

    return account as Account;
  }

  delete(id: number): Promise<DeleteResult> {
    return this.accountRepository.delete({ id });
  }

  /** @param withHashedPassword WARNING ! Never return a password to end user, even hashed */
  async findByEmail(
    email: string,
    withHashedPassword = false,
  ): Promise<Account | undefined> {
    return this.accountRepository
      .createQueryBuilder('account')
      .where('LOWER(account.email) = LOWER(:email)', { email })
      .addSelect(withHashedPassword ? 'account.password' : '')
      .getOne();
  }

  async updatePassword(id: number, newPassword: string): Promise<Account> {
    const toUpdate = await this.accountRepository.findOne(id);
    if (!toUpdate) {
      throw new NotFoundException(`Account #${id} not found`);
    }
    const updatedAccount = {
      ...toUpdate,
      isConfirmed: true,
      password: await hash(newPassword),
    } as Account;
    const accountWithPassword = await this.accountRepository.save(
      updatedAccount,
    );
    const { password, ...account } = accountWithPassword;

    return account as Account;
  }
}

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

  create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create(createAccountDto);

    return this.accountRepository.save(account);
  }

  findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  /** @param withHashedPassword WARNING ! Never return a password to end user, even hashed */
  async findOne(
    id: number,
    withHashedPassword = false,
  ): Promise<Account | undefined> {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .where('account.id = :id', { id })
      .addSelect(withHashedPassword ? 'account.password' : '')
      .getOne();

    return account;
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const toUpdate = await this.accountRepository.findOne(id);
    if (!toUpdate) {
      throw new NotFoundException(`Account #${id} not found`);
    }
    const updated = { ...toUpdate, ...updateAccountDto } as Account;

    return this.accountRepository.save(updated);
  }

  delete(id: number): Promise<DeleteResult> {
    return this.accountRepository.delete({ id });
  }

  /** @param withHashedPassword WARNING ! Never return a password to end user, even hashed */
  async findByEmail(
    email: string,
    withHashedPassword = false,
  ): Promise<Account | undefined> {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .where('LOWER(account.email) = LOWER(:email)', { email })
      .addSelect(withHashedPassword ? 'account.password' : '')
      .getOne();

    return account;
  }

  async updatePassword(id: number, newPassword: string): Promise<Account> {
    const toUpdate = await this.accountRepository.findOne(id);
    if (!toUpdate) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    const updated = {
      ...toUpdate,
      password: await hash(newPassword),
    } as Account;

    return this.accountRepository.save(updated);
  }
}

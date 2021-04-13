// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';

import { Account } from '../../accounts/entities/account.entity';

export interface RequestWithAccount extends Request {
  user: Account;
}

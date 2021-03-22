import { IsString } from 'class-validator';

import { Account } from '../../accounts/entities/account.entity';

export class LoggedInUserDto {
  /**
   * Logged in user's json web token
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5kb2VAbWEuY29tIiwiaWF0IjoxNjE2MjUzMzMzLCJleHAiOjE2MTYyNTQyMzN9.45VSQ8wkaNVdGbBZgC3EY6nHlWhHhdcV2I910a8-'
   */
  @IsString()
  jwt!: string;

  /**
   * User's Account
   */
  account!: Account;
}

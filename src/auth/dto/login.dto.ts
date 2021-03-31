import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  /**
   * Login email
   * @example 'johndoe@email.com'
   */
  @IsEmail()
  @MaxLength(255)
  email!: string;

  /**
   * Login password
   * @example 'JohnDoePass123'
   */
  @IsString()
  @MaxLength(255)
  password!: string;
}

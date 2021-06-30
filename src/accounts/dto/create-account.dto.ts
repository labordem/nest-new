import { IsEmail, IsString, Length } from 'class-validator';

export class CreateAccountDto {
  /**
   * Login email.
   * @example 'johndoe@email.com'
   */
  @IsEmail()
  @Length(5, 255)
  email!: string;

  /**
   * User first name.
   * @example 'John'
   */
  @IsString()
  @Length(2, 50)
  firstName!: string;

  /**
   * User last name.
   * @example 'Doe'
   */
  @IsString()
  @Length(2, 50)
  lastName!: string;

  /**
   * Login password.
   * @example 'JohnDoePass123'
   */
  @IsString()
  @Length(8, 255)
  password!: string;
}

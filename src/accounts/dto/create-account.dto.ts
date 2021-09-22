import { IsEmail, IsOptional, Length, MaxLength } from 'class-validator';

export class CreateAccountDto {
  /**
   * Login email.
   * @example 'johndoe@email.com'
   */
  @IsEmail()
  @MaxLength(255)
  email!: string;

  /**
   * User first name.
   * @example 'John'
   */
  @Length(2, 50)
  firstName!: string;

  /**
   * User last name.
   * @example 'Doe'
   */
  @Length(2, 50)
  lastName!: string;

  /**
   * Login password.
   * @example 'JohnDoePass123'
   */
  @Length(8, 255)
  password!: string;

  /**
   * Account bio.
   * @example 'I love cats and prefer trains to planes.'
   */
  @IsOptional()
  @Length(1, 255)
  bio?: string;
}

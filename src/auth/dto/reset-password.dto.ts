import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  /**
   * New login password.
   * @example 'JohnDoeNewPass1234'
   */
  @IsString()
  @Length(8, 255)
  newPassword!: string;
}

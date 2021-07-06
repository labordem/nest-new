import { IsNumber, IsString } from 'class-validator';

export class CreateUploadDto {
  /**
   * Filename at the moment it has been uploaded
   * @example 'avatar.jpg'
   */
  @IsString()
  filename!: string;

  /**
   * File path, must be prefixed by server host
   * @example 'uploads/public/uuid.jpg'
   */
  @IsString()
  path!: string;

  /**
   * File size in bytes
   * @example 2000000
   */
  @IsNumber()
  size!: number;

  /**
   * File mime type
   * @example 'image/jpeg'
   */
  @IsString()
  mimeType!: string;

  /**
   * Resized file path, must be prefixed by server host
   * @example 'uploads/public/uuid-thumb.jpg'
   */
  @IsString()
  thumbPath?: string;

  /**
   * Resized file size in bytes
   * @example 2000000
   */
  @IsNumber()
  thumbSize?: number;

  /**
   * Resized file mime type
   * @example 'image/jpeg'
   */
  @IsString()
  thumbMimeType?: string;
}

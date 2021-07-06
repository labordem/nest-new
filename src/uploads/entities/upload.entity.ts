import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Upload {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  /**
   * Filename at the moment it has been uploaded
   * @example 'avatar.jpg'
   */
  @Column()
  filename!: string;

  /**
   * File path, must be prefixed by server host
   * @example 'uploads/public/uuid.jpg'
   */
  @Column()
  path!: string;

  /**
   * File size in bytes
   * @example 2000000
   */
  @Column()
  size!: number;

  /**
   * File mime type
   * @example 'image/jpeg'
   */
  @Column()
  mimeType!: string;

  /**
   * Resized file path, must be prefixed by server host
   * @example 'uploads/public/uuid-thumb.jpg'
   */
  @Column()
  thumbPath?: string;

  /**
   * Resized file size in bytes
   * @example 2000000
   */
  @Column()
  thumbSize?: number;

  /**
   * Resized file mime type
   * @example 'image/jpeg'
   */
  @Column()
  thumbMimeType?: string;
}

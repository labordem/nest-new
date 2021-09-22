import { ApiHideProperty } from '@nestjs/swagger';
import { hash } from 'argon2';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Upload } from '../../uploads/entities/upload.entity';

export enum Role {
  /** Software Editor Administrator, has all rights. */
  Admin = 'admin',
  /** Applications end user. */
  User = 'user',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  /**
   * Account email.
   * @example 'johndoe@email.com'
   */
  @ApiHideProperty()
  @Column({ select: false, unique: true })
  email!: string;

  /**
   * Account password hash.
   * @example '$argon2i$v=19$m=16,t=2,p=1$RER6c24zYTFSQVZMZllCTA$Jn1399jd7Z2j/0VLzu07IA'
   */
  @ApiHideProperty()
  @Column({ select: false })
  password!: string;

  /**
   * A boolean that is true if Account email is confirmed.
   * @example false
   */
  @Column({ default: false })
  isConfirmed!: boolean;

  /**
   * Account roles.
   * @example ```typescript ['admin']```
   */
  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.User],
  })
  roles!: Role[];

  /**
   * Account first name.
   * @example 'John'
   */
  @Column()
  firstName!: string;

  /**
   * Account last name.
   * @example 'Doe'
   */
  @Column()
  lastName!: string;

  /**
   * Account bio.
   * @example 'I love cats and prefer trains to planes.'
   */
  @Column({ nullable: true })
  bio?: string;

  @JoinColumn()
  @OneToOne(() => Upload, {
    eager: true,
  })
  avatar?: Upload;

  @BeforeInsert()
  async prepareToInsert(): Promise<void> {
    this.password = await hash(this.password);
    this.email = this.email.toLowerCase();
  }
}

import { ApiHideProperty } from '@nestjs/swagger';
import { hash } from 'argon2';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  Admin = 'admin',
  Ghost = 'ghost',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  /**
   * Last update timestamp
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  /**
   * Login email
   * @example 'johndoe@email.com'
   */
  @Column({ unique: true })
  email!: string;

  /**
   * Login password hash
   * @example 'JohnDoePass123'
   */
  @ApiHideProperty()
  @Exclude()
  @Column({ select: false })
  password!: string;

  /**
   * A boolean that is true if login email is confirmed
   * @example false
   */
  @Column({ default: false })
  isConfirmed!: boolean;

  /**
   * A list of account's roles
   * @example ['admin']
   */
  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.Ghost],
  })
  roles!: Role[];

  /**
   * User first name
   * @example 'John'
   */
  @Column()
  firstName!: string;

  /**
   * User last name
   * @example 'Doe'
   */
  @Column()
  lastName!: string;

  /**
   * User profile image
   * @example false
   */
  @Column({ nullable: true })
  avatar?: string;

  @BeforeInsert()
  async prepareToInsert(): Promise<void> {
    this.password = await hash(this.password);
    this.email = this.email.toLowerCase();
  }
}

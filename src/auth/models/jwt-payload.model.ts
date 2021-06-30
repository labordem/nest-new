import { Role } from '../../accounts/entities/account.entity';

export interface UserJwtPayload {
  id: number;
  createdAt: Date;
  roles: Role[];
  isConfirmed: boolean;
}

export interface EmailJwtPayload {
  id: number;
  createdAt: Date;
}

export interface ForgotPasswordJwtPayload {
  id: number;
  createdAt: Date;
}

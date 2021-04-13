import { Role } from '../../accounts/entities/account.entity';

export interface UserJwtPayload {
  id: number;
  email: string;
  roles: Role[];
  isConfirmed: boolean;
}

export interface EmailJwtPayload {
  email: string;
}

export interface ForgotPasswordJwtPayload {
  id: number;
}

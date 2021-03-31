import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verify } from 'jsonwebtoken';

import { UserJwtPayload } from '../../auth/auth.service';
import { environment } from '../../environment';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // If route not require a specific Role activate it
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    // Account need a specific Role to continue, so check his token
    const { authorization } = context
      .switchToHttp()
      .getRequest<{ headers: { authorization: string } }>().headers;
    if (!authorization) {
      return false;
    }
    const token = authorization.split(' ')[1];
    const payload = this.getPayloadFromToken(token);
    if (!payload?.id) {
      return false;
    }
    // Token signature is valid, so check if payload meets the requirements
    if (!payload.isConfirmed) {
      return false;
    }
    if (!payload.roles) {
      return false;
    }
    const isAdmin = !!payload.roles.find((role) => role === 'admin');
    if (isAdmin) {
      return true;
    }
    const hasRole = payload.roles.some(
      (role) => !!requiredRoles.find((requiredRole) => requiredRole === role),
    );

    return hasRole;
  }

  private getPayloadFromToken(token: string): UserJwtPayload {
    const secretKey = environment.apiUserJwtKey;

    return verify(token, secretKey) as UserJwtPayload;
  }
}

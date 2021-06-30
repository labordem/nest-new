import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Role } from '../../accounts/entities/account.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

/** If this decorator is present then the user needs one of the parameters roles to pass. */
export const Roles = (...roles: Role[]): MethodDecorator =>
  applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiSecurity('bearer'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden resource' }),
    ApiOperation({ summary: `${roles.join(' or ')} role needed.` }),
  );

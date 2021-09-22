import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
    ApiOperation({ summary: `${roles.join(' or ')} role needed.` }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized error response.',
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'number',
            example: '401',
          },
          message: {
            type: 'string',
            example: 'Unauthorized',
          },
          path: {
            type: 'string',
            example: '/api/accounts',
          },
          thrownAt: {
            type: 'string',
            example: '2021-09-21T15:39:45.221Z',
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden error response.',
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'number',
            example: '403',
          },
          message: {
            type: 'string',
            example: 'Forbidden Exception',
          },
          error: {
            type: 'string',
            example: 'FORBIDDEN_MUST_BE_OWNER',
          },
          path: {
            type: 'string',
            example: '/api/accounts/1/avatar',
          },
          thrownAt: {
            type: 'string',
            example: '2021-09-21T15:39:45.221Z',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad request error response.',
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'number',
            example: '400',
          },
          message: {
            type: 'string',
            example: 'Bad Request Exception',
          },
          validations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property: {
                  type: 'string',
                  example: 'email',
                },
                constraints: {
                  properties: {
                    isLength: {
                      type: 'string',
                      example: 'email must be an email',
                    },
                  },
                  type: 'object',
                },
              },
            },
          },
          path: {
            type: 'string',
            example: '/api/auth/register',
          },
          thrownAt: {
            type: 'string',
            example: '2021-09-21T15:39:45.221Z',
          },
        },
      },
    }),
  );

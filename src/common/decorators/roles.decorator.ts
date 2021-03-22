import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const Roles = (...args: string[]): CustomDecorator<string> =>
  SetMetadata('roles', args);

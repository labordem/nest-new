import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** If this decorator is present then the user needs one of the parameters roles to pass */
export const Roles = (...args: string[]): CustomDecorator<string> =>
  SetMetadata('roles', args);

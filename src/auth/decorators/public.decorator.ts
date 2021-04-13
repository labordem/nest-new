import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** If this decorator is present then there is no need for access token to pass */
export const Public = (isPublic = true): CustomDecorator<string> =>
  SetMetadata('isPublic', isPublic);

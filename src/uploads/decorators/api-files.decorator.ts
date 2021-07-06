import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

/** Add multipart/form-data OpenApi definitions, for many files upload */
export const ApiFiles = (fieldName = 'file'): MethodDecorator => {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      isArray: true,
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            description: 'Files to uploads',
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
  );
};

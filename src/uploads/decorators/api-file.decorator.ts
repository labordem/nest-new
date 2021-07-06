import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

/** Add multipart/form-data OpenApi definitions, for one file upload */
export const ApiFile = (fieldName = 'file'): MethodDecorator => {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            description: 'File to upload',
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
};

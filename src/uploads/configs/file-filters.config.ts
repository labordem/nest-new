import { BadRequestException } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';

export const imageAllowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];

export const avatarFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, isAllowed: boolean) => void,
): void => {
  const isAllowed = imageAllowedMimeTypes?.includes(file.mimetype) ?? false;
  return callback(
    isAllowed ? null : new BadRequestException('Must be an avatar'),
    isAllowed,
  );
};

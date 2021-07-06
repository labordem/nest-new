// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const uniqueFilenameGenerator = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
): void =>
  callback(null, `${uuid()}${extname(file.originalname).toLowerCase()}`);

export const filenameWithSuffixGenerator = (
  filename: string,
  suffix: string,
): string => {
  return `${filename.substring(
    0,
    filename.lastIndexOf('.'),
  )}${suffix}${filename.substring(filename.lastIndexOf('.'))}`;
};

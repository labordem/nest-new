import { InternalServerErrorException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
// eslint-disable-next-line import/no-extraneous-dependencies
import { diskStorage } from 'multer';

import {
  UploadCategory,
  UploadCategoryName,
} from '../models/upload-category.model';
import { avatarFileFilter } from './file-filters.config';
import { uniqueFilenameGenerator } from './filename-generators.config';

export const uploadCategories: UploadCategory[] = [
  {
    fieldName: UploadCategoryName.Avatar,
    destination: 'uploads/public',
    fileSizeLimit: 5 * 1000000, // 5 mb
    maxWidthHeight: 720,
    fileFilter: avatarFileFilter,
  },
];

const getCorrectMulterConfig = (
  uploadCategory: UploadCategory,
): MulterOptions => ({
  limits: {
    fileSize: uploadCategory.fileSizeLimit,
    fieldNameSize: uploadCategory.fieldName.length,
  },
  storage: diskStorage({
    destination: uploadCategory.destination,
    filename: uniqueFilenameGenerator,
  }),
  fileFilter: uploadCategory.fileFilter,
});

export const multerConfig = (
  uploadCategoryName: UploadCategoryName,
): MulterOptions => {
  const uploadCategory = uploadCategories.find(
    (category) => category.fieldName === uploadCategoryName,
  );
  if (!uploadCategory) {
    throw new InternalServerErrorException();
  }
  return getCorrectMulterConfig(uploadCategory);
};

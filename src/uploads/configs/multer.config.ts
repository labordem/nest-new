import { InternalServerErrorException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

import { environment } from '../../environment';
import {
  UploadCategory,
  UploadCategoryName,
} from '../models/upload-category.model';
import { avatarFileFilter } from './file-filters.config';
import { uniqueFilenameGenerator } from './filename-generators.config';

export const uploadCategories: UploadCategory[] = [
  {
    fieldName: UploadCategoryName.Avatar,
    destination: environment.S3PublicBucketName,
    fileSizeLimit: 5 * 1000000, // 5 mb
    maxWidthHeight: 180,
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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';

export enum UploadCategoryName {
  Avatar = 'avatar',
}

export interface UploadCategory {
  fieldName: UploadCategoryName;
  /** Destination path for uploaded files. */
  destination: string;
  /** File size limit in bytes */
  fileSizeLimit: number;
  /** Max width/height for image file, in pixels */
  maxWidthHeight?: number;
  /** File filter function */
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, isAllowed: boolean) => void,
  ) => void;
}

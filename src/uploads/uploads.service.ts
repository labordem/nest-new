import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { Repository } from 'typeorm';

import { ProcessedDto } from '../common/dto/processed.dto';
import { filenameWithSuffixGenerator } from './configs/filename-generators.config';
import { uploadCategories } from './configs/multer.config';
import { CreateUploadDto } from './dto/create-upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadCategoryName } from './models/upload-category.model';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}

  async createMany(
    files: Express.Multer.File[],
    uploadCategoryName?: UploadCategoryName,
  ): Promise<Upload[]> {
    if (!files?.length) {
      throw new BadRequestException('Invalid file(s)');
    }
    const uploadedFilePromises = files.map((file) =>
      this.create(file, uploadCategoryName),
    );

    return Promise.all(uploadedFilePromises);
  }

  async create(
    file: Express.Multer.File,
    uploadCategoryName?: UploadCategoryName,
  ): Promise<Upload> {
    const uploadCategory = uploadCategories.find(
      (category) => category.fieldName === uploadCategoryName,
    );
    let resizeInfo: (sharp.OutputInfo & { path: string }) | undefined;
    if (uploadCategoryName) {
      if (uploadCategory?.maxWidthHeight) {
        resizeInfo = await this.resizeImage(
          file,
          uploadCategory.maxWidthHeight,
          '-thumb',
        );
      }
    }
    const createUploadDto: CreateUploadDto = {
      path: file.path,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      thumbSize: resizeInfo ? resizeInfo.size : undefined,
      thumbPath: resizeInfo ? resizeInfo.path : undefined,
      thumbMimeType: resizeInfo ? `image/${resizeInfo.format}` : undefined,
    };
    const createdUpload = this.uploadRepository.create(createUploadDto);

    return this.uploadRepository.save(createdUpload);
  }

  async delete(id: number): Promise<ProcessedDto> {
    const upload = await this.uploadRepository.findOneOrFail(id);
    void this.uploadRepository.delete(id);
    fs.unlink(upload?.path ?? '', () => {});
    fs.unlink(upload?.thumbPath ?? '', () => {});

    return { isProcessed: true };
  }

  private async resizeImage(
    file: Express.Multer.File,
    maxWidthHeight = 500,
    filenameSuffix: string,
  ): Promise<sharp.OutputInfo & { path: string }> {
    const path = filenameWithSuffixGenerator(file.path, filenameSuffix);
    const resizeInfo = await sharp(file.path)
      .resize({
        width: maxWidthHeight,
        height: maxWidthHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ mozjpeg: true, progressive: true })
      .toFile(path);

    return { ...resizeInfo, path };
  }
}

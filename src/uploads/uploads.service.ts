import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { Repository } from 'typeorm';

import { ProcessedDto } from '../common/dto/processed.dto';
import { environment } from '../environment';
import { filenameWithSuffixGenerator } from './configs/filename-generators.config';
import { uploadCategories } from './configs/multer.config';
import { CreateUploadDto } from './dto/create-upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadCategoryName } from './models/upload-category.model';

const {
  s3Protocol,
  s3Host,
  s3Port,
  s3AccessKeyId,
  s3SecretAccessKey,
  s3Region,
  S3PublicBucketName,
} = environment;

const s3 = new S3({
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
  endpoint: `${s3Protocol}://${s3Host}:${s3Port}`,
  s3ForcePathStyle: true,
  region: s3Region,
});

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}

  async createMany(
    files: Express.Multer.File[],
    uploadCategoryName: UploadCategoryName,
  ): Promise<Upload[]> {
    if (!files.length) {
      throw new BadRequestException('Invalid file(s)');
    }
    const uploadedFilePromises = files.map((file) =>
      this.create(file, uploadCategoryName),
    );

    return Promise.all(uploadedFilePromises);
  }

  async create(
    file: Express.Multer.File,
    uploadCategoryName: UploadCategoryName,
  ): Promise<Upload> {
    const uploadCategory = uploadCategories.find(
      (category) => category.fieldName === uploadCategoryName,
    );
    let resizeInfo: (sharp.OutputInfo & { path: string }) | undefined;
    if (uploadCategory) {
      if (uploadCategory.maxWidthHeight) {
        resizeInfo = await this.resizeImage(
          file,
          uploadCategory.maxWidthHeight,
          '-thumb',
        );
      }
    }
    const uploadResult = await s3
      .upload({
        Bucket: S3PublicBucketName,
        Body: fs.createReadStream(resizeInfo ? resizeInfo.path : file.path),
        Key: file.filename,
      })
      .promise();
    const uselessFilesOnDisk = [file.path, resizeInfo?.path];
    uselessFilesOnDisk.map((filePath) => fs.unlink(filePath ?? '', () => {}));
    const createUploadDto: CreateUploadDto = {
      path: uploadResult.Location,
      filename: file.originalname,
      size: resizeInfo ? resizeInfo.size : file.size,
      mimeType: resizeInfo ? `image/${resizeInfo.format}` : file.mimetype,
      key: file.filename,
    };
    const createdUpload = this.uploadRepository.create(createUploadDto);

    return this.uploadRepository.save(createdUpload);
  }

  async delete(id: number): Promise<ProcessedDto> {
    const upload = await this.uploadRepository.findOneOrFail(id);
    void this.uploadRepository.delete(id);
    await s3
      .deleteObject({
        Bucket: S3PublicBucketName,
        Key: upload.key,
      })
      .promise();

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

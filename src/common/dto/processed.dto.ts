import { IsBoolean } from 'class-validator';

export class ProcessedDto {
  @IsBoolean()
  isProcessed!: boolean;
}

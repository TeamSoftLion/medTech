import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RecordTypeDto } from './create-medical-record.dto';

export class QueryMedicalRecordDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(RecordTypeDto)
  type?: RecordTypeDto;

  @IsOptional()
  @IsString()
  q?: string; // description/prescription bo'yicha qidiruv

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest';
}

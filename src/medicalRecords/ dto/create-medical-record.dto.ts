import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RecordTypeDto {
  diagnosis = 'diagnosis',
  treatment = 'treatment',
  note = 'note',
}

export class CreateMedicalRecordDto {
  @IsEnum(RecordTypeDto)
  type: RecordTypeDto;

  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  prescription?: string;
}

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum AppointmentStatusDto {
  scheduled = 'scheduled',
  completed = 'completed',
  canceled = 'canceled',
}

export class CreateAppointmentDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsOptional()
  @IsEnum(AppointmentStatusDto)
  status?: AppointmentStatusDto;

  @IsOptional()
  @IsString()
  reason?: string;
}

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatusDto } from './create-appointment.dto';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(AppointmentStatusDto)
  status?: AppointmentStatusDto;
}

import { IsEnum } from 'class-validator';
import { AppointmentStatusDto } from './create-appointment.dto';

export class UpdateStatusDto {
  @IsEnum(AppointmentStatusDto)
  status: AppointmentStatusDto;
}

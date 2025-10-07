import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { MedicalRecordsService } from './medical-records.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CreateMedicalRecordDto } from './ dto/create-medical-record.dto';
import { QueryMedicalRecordDto } from './ dto/query-medical-record.dto';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients/:patientId/records')
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Roles('admin', 'doctor')
  @Post()
  create(
    @Param('patientId') patientId: string,
    @Req() req: any,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.service.create(patientId, req.user.sub, req.user.role, dto);
  }

  @Roles('admin', 'doctor', 'reception')
  @Get()
  list(
    @Param('patientId') patientId: string,
    @Req() req: any,
    @Query() query: QueryMedicalRecordDto,
  ) {
    return this.service.list(patientId, req.user.sub, req.user.role, query);
  }
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('records')
export class SingleRecordController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Roles('admin', 'doctor', 'reception')
  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.service.getOne(id, req.user.sub, req.user.role);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.role);
  }
}

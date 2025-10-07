import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { PatientsService } from './patients.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { ListPatientsDto } from './dto/list-patients.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDTO } from './dto/update-patient.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private service: PatientsService) {}

  @Roles('admin', 'doctor', 'reception')
  @Get()
  list(@Query() query: ListPatientsDto) {
    return this.service.list(query);
  }
  @Roles('admin', 'doctor', 'reception')
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.service.create(dto);
  }
  @Roles('admin', 'doctor', 'reception')
  @Get(':id')
  getOne(@Param() id: string) {
    return this.service.getOne(id);
  }
  @Roles('admin', 'reception')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDTO) {
    return this.service.update(id, dto);
  }
  @Roles('admin')
  @Delete(':id')
  delete(@Param() id: string) {
    return this.service.remove(id);
  }
}

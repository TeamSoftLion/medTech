import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import {
  MedicalRecordsController,
  SingleRecordController,
} from './medical-records.controller';

@Module({
  controllers: [MedicalRecordsController, SingleRecordController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}

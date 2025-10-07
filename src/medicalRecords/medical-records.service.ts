import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMedicalRecordDto } from './ dto/create-medical-record.dto';
import { QueryMedicalRecordDto } from './ dto/query-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  private canCreate(role: string) {
    return role === 'admin' || role === 'doctor';
  }
  private canList(role: string) {
    return role === 'admin' || role === 'doctor' || role === 'reception';
  }

  private async ensurePatientExists(patientId: string) {
    const p = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Patient not found');
  }

  async create(
    patientId: string,
    authorId: string,
    authorRole: string,
    dto: CreateMedicalRecordDto,
  ) {
    if (!this.canCreate(authorRole))
      throw new ForbiddenException('Only doctor or admin can add records');
    await this.ensurePatientExists(patientId);
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });
    if (!author) throw new BadRequestException('Author not found');

    return this.prisma.medicalRecord.create({
      data: {
        patientId,
        authorId,
        type: dto.type as any,
        description: dto.description,
        prescription: dto.prescription,
      },
      select: {
        id: true,
        type: true,
        description: true,
        prescription: true,
        createdAt: true,
        author: {
          select: { id: true, firstname: true, lastname: true, role: true },
        },
      },
    });
  }

  async list(
    patientId: string,
    requesterId: string,
    requesterRole: string,
    query: QueryMedicalRecordDto,
  ) {
    if (!this.canList(requesterRole)) throw new ForbiddenException();
    await this.ensurePatientExists(patientId);

    const where: any = { patientId };
    if (query.type) where.type = query.type as any;
    if (query.q) {
      where.OR = [
        { description: { contains: query.q, mode: 'insensitive' } },
        { prescription: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      query.sort === 'oldest'
        ? { createdAt: 'asc' as const }
        : { createdAt: 'desc' as const };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.medicalRecord.findMany({
        where,
        orderBy,
        skip: query.offset ?? 0,
        take: query.limit ?? 20,
        select: {
          id: true,
          type: true,
          description: true,
          prescription: true,
          createdAt: true,
          author: {
            select: { id: true, firstname: true, lastname: true, role: true },
          },
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      total,
      offset: query.offset ?? 0,
      limit: query.limit ?? 20,
      items,
    };
  }

  async getOne(id: string, requesterId: string, requesterRole: string) {
    if (!this.canList(requesterRole)) throw new ForbiddenException();
    const rec = await this.prisma.medicalRecord.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        description: true,
        prescription: true,
        createdAt: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
        author: {
          select: { id: true, firstname: true, lastname: true, role: true },
        },
      },
    });
    if (!rec) throw new NotFoundException('Record not found');

    return rec;
  }

  async remove(id: string, requesterRole: string) {
    // faqat admin o'chirishiga ruxsat beramiz
    if (requesterRole !== 'admin') throw new ForbiddenException();
    const exists = await this.prisma.medicalRecord.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Record not found');
    await this.prisma.medicalRecord.delete({ where: { id } });
    return { message: 'Record deleted' };
  }
}

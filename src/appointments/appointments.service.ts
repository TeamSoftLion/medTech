import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private async ensurePatient(id: string) {
    const p = await this.prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!p) throw new BadRequestException('Patient not found');
  }
  private async ensureDoctor(id: string) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!u || u.role !== 'doctor')
      throw new BadRequestException('Doctor not found');
  }

  async create(dto: CreateAppointmentDto, createdBy?: string) {
    await this.ensurePatient(dto.patientId);
    await this.ensureDoctor(dto.doctorId);

    // vaqt oralig'i tekshiruvi
    if (new Date(dto.endAt) <= new Date(dto.startAt)) {
      throw new BadRequestException('endAt must be after startAt');
    }

    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        status: (dto.status as any) ?? AppointmentStatus.scheduled,
        reason: dto.reason,
        createdBy,
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        reason: true,
        createdBy: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: {
          select: { id: true, firstname: true, lastname: true, role: true },
        },
      },
    });
  }

  async list(query: ListAppointmentsDto) {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.status) where.status = query.status as any;

    if (query.from || query.to) {
      where.startAt = {};
      if (query.from) where.startAt.gte = new Date(query.from);
      if (query.to) where.startAt.lte = new Date(query.to);
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (query.sort === 'startAsc') orderBy = { startAt: 'asc' };
    if (query.sort === 'startDesc') orderBy = { startAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        orderBy,
        skip: query.offset ?? 0,
        take: query.limit ?? 20,
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          reason: true,
          patient: { select: { id: true, firstName: true, lastName: true } },
          doctor: {
            select: { id: true, firstname: true, lastname: true, role: true },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      total,
      offset: query.offset ?? 0,
      limit: query.limit ?? 20,
      items,
    };
  }

  async getOne(id: string) {
    const a = await this.prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        reason: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: {
          select: { id: true, firstname: true, lastname: true, role: true },
        },
      },
    });
    if (!a) throw new NotFoundException('Appointment not found');
    return a;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const exists = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Appointment not found');

    if (dto.doctorId) await this.ensureDoctor(dto.doctorId);
    const data: any = {};
    if (dto.doctorId) data.doctorId = dto.doctorId;
    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);
    if (dto.reason !== undefined) data.reason = dto.reason;
    if (dto.status) data.status = dto.status as any;

    if (data.startAt && data.endAt && data.endAt <= data.startAt) {
      throw new BadRequestException('endAt must be after startAt');
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        reason: true,
        createdBy: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: {
          select: { id: true, firstname: true, lastname: true, role: true },
        },
      },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const exists = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Appointment not found');

    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status as any },
      select: { id: true, status: true },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Appointment not found');
    await this.prisma.appointment.delete({ where: { id } });
    return { message: 'Appointment deleted' };
  }
}

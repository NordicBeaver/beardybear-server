import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  Appointment,
  Barber,
  BarberService,
  Prisma,
  UserRole,
} from '@prisma/client';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  BarberServiceDto,
  barberServiceToDto,
} from 'src/barber-services/barber-services.controller';
import { BarberDto, barberToDto } from 'src/barbers/barbers.controller';
import { PrismaService } from 'src/prisma/prisma.service';

interface AppoinmentDto {
  id: number;
  barber: BarberDto;
  barberService: BarberServiceDto;
  datetime: string;
  clientName: string;
  clientPhoneNumber: string;
}

type AppointmentFull = Appointment & {
  barber: Barber;
  barberService: BarberService;
};

function appointmentToDto(appointment: AppointmentFull) {
  const dto: AppoinmentDto = {
    id: appointment.id,
    barber: barberToDto(appointment.barber),
    barberService: barberServiceToDto(appointment.barberService),
    datetime: appointment.datetime.toISOString(),
    clientName: appointment.clientName,
    clientPhoneNumber: appointment.clientPhoneNumber,
  };
  return dto;
}

class FindAllAppointmentsParams {
  @IsOptional()
  @IsString()
  sortField?: 'barber' | 'service' | 'datetime';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

class CreateAppointmentDto {
  @IsNumber()
  barberId: number;

  @IsNumber()
  barberServiceId: number;

  @IsDateString()
  datetime: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientPhoneNumber: string;
}

class UpdateAppointmentDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  barberId?: number;

  @IsOptional()
  @IsNumber()
  barberServiceId?: number;

  @IsOptional()
  @IsDateString()
  datetime?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientPhoneNumber?: string;
}

@Controller('appointments')
export class AppointmentsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GUEST)
  @Get()
  async findAll(@Query() query: FindAllAppointmentsParams) {
    const sortOrder =
      query.sortOrder === 'desc' ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;
    const appointments = await this.prisma.appointment.findMany({
      include: { barber: true, barberService: true },
      orderBy: {
        barber: query.sortField === 'barber' ? { name: sortOrder } : undefined,
        barberService:
          query.sortField === 'service' ? { name: sortOrder } : undefined,
        datetime: query.sortField === 'datetime' ? sortOrder : undefined,
      },
    });
    const appointmentsDto = appointments.map(appointmentToDto);
    return appointmentsDto;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GUEST)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) appointmentId: number) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId },
      include: { barber: true, barberService: true },
    });
    if (appointment == null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const appointmentDto = appointmentToDto(appointment);
    return appointmentDto;
  }

  @Post()
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    const appointment = await this.prisma.appointment.create({
      data: {
        barberId: dto.barberId,
        barberServiceId: dto.barberServiceId,
        datetime: dto.datetime,
        clientName: dto.clientName,
        clientPhoneNumber: dto.clientPhoneNumber,
      },
      include: { barber: true, barberService: true },
    });
    const appointmentDto = appointmentToDto(appointment);
    return appointmentDto;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('/update')
  async updateAppointment(@Body() dto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.update({
      where: { id: dto.id },
      data: {
        barberId: dto.barberId,
        barberServiceId: dto.barberServiceId,
        datetime: dto.datetime,
        clientName: dto.clientName,
        clientPhoneNumber: dto.clientPhoneNumber,
      },
      include: { barber: true, barberService: true },
    });
    const appointmentDto = appointmentToDto(appointment);
    return appointmentDto;
  }
}

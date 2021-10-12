import { Appointment, Barber, BarberService } from '@prisma/client';
import { Controller, Get } from '@nestjs/common';
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
  };
  return dto;
}

@Controller('appointments')
export class AppointmentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const appointments = await this.prisma.appointment.findMany({
      include: { barber: true, barberService: true },
    });
    const appointmentsDto = appointments.map(appointmentToDto);
    return appointmentsDto;
  }
}

import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Barber } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

interface BarberDto {
  id: number;
  name: string;
  description: string;
}

function barberToDto(barber: Barber) {
  const dto: BarberDto = {
    id: barber.id,
    name: barber.name,
    description: barber.description,
  };
  return dto;
}

@Controller('barbers')
export class BarbersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const barbers = await this.prisma.barber.findMany();
    const barbersDto = barbers.map(barberToDto);
    return barbersDto;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) barberId: number) {
    const barber = await this.prisma.barber.findFirst({
      where: { id: barberId },
    });
    if (barber == null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const barberDto = barberToDto(barber);
    return barberDto;
  }
}

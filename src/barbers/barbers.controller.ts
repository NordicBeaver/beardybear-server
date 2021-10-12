import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Barber } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface BarberDto {
  id: number;
  name: string;
  description: string;
  picture: string | null;
}

export function barberToDto(barber: Barber) {
  const dto: BarberDto = {
    id: barber.id,
    name: barber.name,
    description: barber.description,
    picture: barber.picture,
  };
  return dto;
}

interface CreateBarberDto {
  name: string;
  description: string;
  picture: string | null;
}

interface UpdateBarberDto {
  id: number;
  name?: string;
  description?: string;
  picture?: string | null;
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

  @Post()
  async createBarber(@Body() dto: CreateBarberDto) {
    const newBarber = await this.prisma.barber.create({
      data: {
        name: dto.name,
        description: dto.description,
        picture: dto.picture,
      },
    });
    const newBarberDto = barberToDto(newBarber);
    return newBarberDto;
  }

  @Post('/update')
  async updateBarber(@Body() dto: UpdateBarberDto) {
    const barber = await this.prisma.barber.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        description: dto.description,
        picture: dto.picture,
      },
    });
    const barberDto = barberToDto(barber);
    return barberDto;
  }
}

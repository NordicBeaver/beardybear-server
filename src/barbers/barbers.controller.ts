import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Barber } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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

class CreateBarberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  picture: string | null;
}

class UpdateBarberDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

import { BarberService } from '.prisma/client';
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
import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

export interface BarberServiceDto {
  id: number;
  name: string;
  price: string;
  description: string;
}

export function barberServiceToDto(barberService: BarberService) {
  const dto: BarberServiceDto = {
    id: barberService.id,
    name: barberService.name,
    price: barberService.price.toString(),
    description: barberService.description,
  };
  return dto;
}

class CreateBarberServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsDecimal()
  price: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

class UpdateBarberServiceDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsDecimal()
  price?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}

@Controller('barber-services')
export class BarberServicesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const barberServices = await this.prisma.barberService.findMany();
    const barberServicesDto = barberServices.map(barberServiceToDto);
    return barberServicesDto;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) barberServiceId: number) {
    const barberService = await this.prisma.barberService.findFirst({
      where: { id: barberServiceId },
    });
    if (barberService == null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const barberServiceDto = barberServiceToDto(barberService);
    return barberServiceDto;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createBarberService(@Body() dto: CreateBarberServiceDto) {
    const newBarberService = await this.prisma.barberService.create({
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
      },
    });
    const newBarberServiceDto = barberServiceToDto(newBarberService);
    return newBarberServiceDto;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/update')
  async updateBarberService(@Body() dto: UpdateBarberServiceDto) {
    const barberService = await this.prisma.barberService.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
      },
    });
    const barberServiceDto = barberServiceToDto(barberService);
    return barberServiceDto;
  }
}

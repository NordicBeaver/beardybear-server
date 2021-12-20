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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Prisma, UserRole } from '@prisma/client';
import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
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

class FindAllBarberServicesParams {
  @IsOptional()
  @IsString()
  sortField?: 'name' | 'price' | 'description';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
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
  async findAll(@Query() query: FindAllBarberServicesParams) {
    const sortOrder =
      query.sortOrder === 'desc' ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;
    const barberServices = await this.prisma.barberService.findMany({
      orderBy: {
        name: query.sortField === 'name' ? sortOrder : undefined,
        price: query.sortField === 'price' ? sortOrder : undefined,
        description: query.sortField === 'description' ? sortOrder : undefined,
      },
    });
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
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

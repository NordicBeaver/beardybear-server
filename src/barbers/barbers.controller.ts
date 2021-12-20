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
import { Barber, Prisma, UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';

export interface BarberDto {
  id: number;
  name: string;
  description: string;
  picture: string | null;
  deletedAt?: string;
}

export function barberToDto(barber: Barber) {
  const dto: BarberDto = {
    id: barber.id,
    name: barber.name,
    description: barber.description,
    picture: barber.picture,
    deletedAt: barber.deletedAt?.toISOString(),
  };
  return dto;
}

class FindAllBarbersParams {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value == 'true')
  includeDeleted?: boolean;

  @IsOptional()
  @IsString()
  sortField?: 'name' | 'description';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
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

class DeleteBarberDto {
  @IsNumber()
  id: number;
}

@Controller('barbers')
export class BarbersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: FindAllBarbersParams) {
    const sortOrder =
      query.sortOrder === 'desc' ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;
    const barbers = await this.prisma.barber.findMany({
      where: {
        deletedAt: query.includeDeleted === true ? undefined : null,
      },
      orderBy: {
        name: query.sortField === 'name' ? sortOrder : undefined,
        description: query.sortField === 'description' ? sortOrder : undefined,
      },
    });
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('/delete')
  async deleteBarber(@Body() dto: DeleteBarberDto) {
    const barber = await this.prisma.barber.update({
      where: { id: dto.id },
      data: {
        deletedAt: new Date(),
      },
    });
    const barberDto = barberToDto(barber);
    return barberDto;
  }
}

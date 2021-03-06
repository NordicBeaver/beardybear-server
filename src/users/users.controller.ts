import { Prisma, User, UserRole } from '.prisma/client';
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
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassord } from 'src/utils';

export interface UserDto {
  id: number;
  name: string;
  role: string;
}

export function userToDto(user: User) {
  const dto: UserDto = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  return dto;
}

class FindAllUsersParams {
  @IsOptional()
  @IsString()
  sortField?: 'name' | 'role';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEnum(UserRole, {
    message: () => {
      const roles = Object.values(UserRole);
      return `Role must be one of the following: ${roles.join(', ')}.`;
    },
  })
  role: UserRole;
}

class CreateFirstUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  @IsEnum(UserRole, {
    message: () => {
      const roles = Object.values(UserRole);
      return `Role must be one of the following: ${roles.join(', ')}.`;
    },
  })
  role?: UserRole;
}

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('/roles')
  async getRoles() {
    const roles = Object.values(UserRole);
    return roles;
  }

  @Get('/any')
  async hasAny() {
    const usersCount = await this.prisma.user.count();
    return usersCount > 0;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: FindAllUsersParams) {
    const sortOrder =
      query.sortOrder === 'desc' ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;
    const users = await this.prisma.user.findMany({
      orderBy: {
        name: query.sortField === 'name' ? sortOrder : undefined,
        role: query.sortField === 'role' ? sortOrder : undefined,
      },
    });
    const usersDto = users.map(userToDto);
    return usersDto;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (user == null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const userDto = userToDto(user);
    return userDto;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const [hash, salt] = await hashPassord(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        passwordHash: hash,
        passwordSalt: salt,
        role: dto.role,
      },
    });
    const newuserDto = userToDto(newUser);
    return newuserDto;
  }

  @Post('/create-first')
  async createFirstUser(@Body() dto: CreateFirstUserDto) {
    const usersCount = await this.prisma.user.count();
    if (usersCount > 0) {
      throw new HttpException(
        'There already are existing users.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [hash, salt] = await hashPassord(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        passwordHash: hash,
        passwordSalt: salt,
        role: UserRole.ADMIN,
      },
    });
    const newuserDto = userToDto(newUser);
    return newuserDto;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('/update')
  async updateUser(@Body() dto: UpdateUserDto) {
    const [newHash, newSalt] =
      dto.password != undefined
        ? await hashPassord(dto.password)
        : [undefined, undefined];
    const user = await this.prisma.user.update({
      where: {
        id: dto.id,
      },
      data: {
        name: dto.name,
        passwordHash: newHash,
        passwordSalt: newSalt,
        role: dto.role,
      },
    });
    const userDto = userToDto(user);
    return userDto;
  }
}

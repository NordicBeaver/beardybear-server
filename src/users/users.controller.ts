import { User } from '.prisma/client';
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
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { randomBytes, scrypt } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';

export interface UserDto {
  id: number;
  name: string;
}

export function userToDto(user: User) {
  const dto: UserDto = {
    id: user.id,
    name: user.name,
  };
  return dto;
}

class CreateUserDto {
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
}

async function hashPassord(password: string): Promise<[string, string]> {
  const salt = randomBytes(8).toString('hex');
  const hashBuffer = (await promisify(scrypt)(password, salt, 64)) as Buffer;
  const hash = hashBuffer.toString('hex');
  return [hash, salt];
}

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    const users = await this.prisma.user.findMany();
    const usersDto = users.map(userToDto);
    return usersDto;
  }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const [hash, salt] = await hashPassord(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        passwordHash: hash,
        passwordSalt: salt,
      },
    });
    const newuserDto = userToDto(newUser);
    return newuserDto;
  }

  @UseGuards(AuthGuard('jwt'))
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
      },
    });
    const userDto = userToDto(user);
    return userDto;
  }
}

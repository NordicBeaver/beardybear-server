import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty, IsString } from 'class-validator';
import { scrypt } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';

class Credentials {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  @Post('/login')
  async login(@Body() { username, password }: Credentials) {
    const invalidCredentialsError = new HttpException(
      'Username/password are not valid.',
      HttpStatus.UNAUTHORIZED,
    );

    const user = await this.prisma.user.findFirst({
      where: { name: username },
    });
    if (user == null) {
      throw invalidCredentialsError;
    }

    const hashBuffer = (await promisify(scrypt)(
      password,
      user.passwordSalt,
      64,
    )) as Buffer;
    const hash = hashBuffer.toString('hex');
    if (hash !== user.passwordHash) {
      throw invalidCredentialsError;
    }

    const token = this.jwtService.sign({ sub: user.id });
    return {
      accessToken: token,
    };
  }
}

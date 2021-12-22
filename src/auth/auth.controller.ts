import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty, IsString } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { checkPassword } from 'src/utils';

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

    const passwordCorrect = checkPassword(
      password,
      user.passwordSalt,
      user.passwordHash,
    );
    if (!passwordCorrect) {
      throw invalidCredentialsError;
    }

    const token = this.jwtService.sign({ sub: user.id });
    return {
      accessToken: token,
    };
  }
}

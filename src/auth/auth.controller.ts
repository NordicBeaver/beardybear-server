import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty, IsString } from 'class-validator';

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
  constructor(private jwtService: JwtService) {}

  @Post('/login')
  login(@Body() { username, password }: Credentials) {
    if (username === 'admin' && password === 'password') {
      const userId = 1;
      const payload = {
        sub: userId,
      };
      const token = this.jwtService.sign(payload);
      return {
        accessToken: token,
      };
    } else {
      throw new HttpException(
        'Username/password are not valid.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

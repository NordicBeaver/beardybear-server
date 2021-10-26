import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BarbersController } from './barbers/barbers.controller';
import { PrismaService } from './prisma/prisma.service';
import { BarberServicesController } from './barber-services/barber-services.controller';
import { ImagesController } from './images/images.controller';
import { AppointmentsController } from './appointments/appointments.controller';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [
    AppController,
    BarbersController,
    BarberServicesController,
    ImagesController,
    AppointmentsController,
    AuthController,
  ],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}

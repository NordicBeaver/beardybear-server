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

@Module({
  imports: [
    JwtModule.register({
      secret: '77d018aacc7bd36f3304673c78548f4c',
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

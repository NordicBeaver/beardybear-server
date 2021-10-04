import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BarbersController } from './barbers/barbers.controller';
import { PrismaService } from './prisma/prisma.service';
import { BarberServicesController } from './barber-services/barber-services.controller';
import { ImagesController } from './images/images.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    BarbersController,
    BarberServicesController,
    ImagesController,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}

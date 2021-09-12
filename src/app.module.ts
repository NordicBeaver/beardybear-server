import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BarbersController } from './barbers/barbers.controller';

@Module({
  imports: [],
  controllers: [AppController, BarbersController],
  providers: [AppService],
})
export class AppModule {}

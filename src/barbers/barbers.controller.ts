import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('barbers')
export class BarbersController {
  @Get()
  async findAll() {
    const client = new PrismaClient();
    const barbers = await client.barber.findMany();
    return barbers;
  }
}

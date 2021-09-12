import { Controller, Get } from '@nestjs/common';

@Controller('barbers')
export class BarbersController {
  @Get()
  async findAll() {
    return [
      {
        id: 0,
        name: 'Best Barber',
      },
      {
        id: 1,
        name: "Best Barber's friend",
      },
    ];
  }
}

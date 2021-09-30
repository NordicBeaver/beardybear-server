import { Test, TestingModule } from '@nestjs/testing';
import { BarberServicesController } from './barber-services.controller';

describe('BarberServicesController', () => {
  let controller: BarberServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarberServicesController],
    }).compile();

    controller = module.get<BarberServicesController>(BarberServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

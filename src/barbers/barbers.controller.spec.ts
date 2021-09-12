import { Test, TestingModule } from '@nestjs/testing';
import { BarbersController } from './barbers.controller';

describe('BarbersController', () => {
  let controller: BarbersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbersController],
    }).compile();

    controller = module.get<BarbersController>(BarbersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Tiles3dController } from '../tiles3d.controller';

describe('Tiles3dController', () => {
  let controller: Tiles3dController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Tiles3dController],
    }).compile();

    controller = module.get<Tiles3dController>(Tiles3dController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

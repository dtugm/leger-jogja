import { Test, TestingModule } from '@nestjs/testing';
import { CitydbToolController } from './citydb-tool.controller';
import { CityDbToolService } from '../services/citydb-tool.service';

describe('CitydbToolController', () => {
  let controller: CitydbToolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitydbToolController],
      providers: [
        {
          provide: CityDbToolService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CitydbToolController>(CitydbToolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Tiles3dService } from '../tiles3d.service';

describe('Tiles3dService', () => {
  let service: Tiles3dService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Tiles3dService],
    }).compile();

    service = module.get<Tiles3dService>(Tiles3dService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

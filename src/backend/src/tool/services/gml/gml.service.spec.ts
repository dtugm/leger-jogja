import { Test, TestingModule } from '@nestjs/testing';
import { GmlService } from './gml.service';

describe('GmlService', () => {
  let service: GmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GmlService],
    }).compile();

    service = module.get<GmlService>(GmlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

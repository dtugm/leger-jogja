import { Test, TestingModule } from '@nestjs/testing';
import { CitydbQueryService } from './citydb-query/citydb-query.service';

describe('CitydbQueryService', () => {
  let service: CitydbQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitydbQueryService],
    }).compile();

    service = module.get<CitydbQueryService>(CitydbQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

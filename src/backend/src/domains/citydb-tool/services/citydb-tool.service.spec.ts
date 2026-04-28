import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CityDbToolService } from './citydb-tool.service';

describe('CitydbToolService', () => {
  let service: CityDbToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityDbToolService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((_key: string, defaultValue?: string) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<CityDbToolService>(CityDbToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

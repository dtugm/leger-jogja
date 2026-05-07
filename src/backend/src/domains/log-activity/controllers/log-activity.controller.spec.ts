import { Test, TestingModule } from '@nestjs/testing';
import { LogActivityController } from './log-activity.controller';

describe('LogActivityController', () => {
  let controller: LogActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogActivityController],
    }).compile();

    controller = module.get<LogActivityController>(LogActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

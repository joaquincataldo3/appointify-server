import { Test, TestingModule } from '@nestjs/testing';
import { YearDaysController } from './year_days.controller';

describe('YearDaysController', () => {
  let controller: YearDaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YearDaysController],
    }).compile();

    controller = module.get<YearDaysController>(YearDaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

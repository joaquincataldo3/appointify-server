import { Test, TestingModule } from '@nestjs/testing';
import { DayOfTheWeekService } from './day_of_the_week.service';

describe('DayOfTheWeekService', () => {
  let service: DayOfTheWeekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DayOfTheWeekService],
    }).compile();

    service = module.get<DayOfTheWeekService>(DayOfTheWeekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { YearDaysService } from './year_days.service';

describe('YearDaysService', () => {
  let service: YearDaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YearDaysService],
    }).compile();

    service = module.get<YearDaysService>(YearDaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

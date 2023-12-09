import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalScheduleModule } from '../professional_schedule.module';

describe('ProfessionalScheduleModule', () => {
  let controller: ProfessionalScheduleModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalScheduleModule],
    }).compile();

    controller = module.get<ProfessionalScheduleModule>(ProfessionalScheduleModule);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

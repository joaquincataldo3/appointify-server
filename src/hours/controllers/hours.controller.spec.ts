import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalHoursController } from './professional_hours.controller';

describe('ProfessionalHoursController', () => {
  let controller: ProfessionalHoursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalHoursController],
    }).compile();

    controller = module.get<ProfessionalHoursController>(ProfessionalHoursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

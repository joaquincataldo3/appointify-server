import { Module } from '@nestjs/common';
import { ProfessionalHoursService } from './services/professional_hours.service';
import { ProfessionalHoursController } from './controllers/professional_hours.controller';

@Module({
  providers: [ProfessionalHoursService],
  controllers: [ProfessionalHoursController]
})
export class ProfessionalHoursModule {}

import { Module } from '@nestjs/common';
import { ProfessionalScheduleController } from './controller/professional_schedule.controller';
import { ProfessionalScheduleService } from './service/professional_schedule.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ProfessionalScheduleController],
  providers: [ProfessionalScheduleService],
  imports: [UsersModule]
})
export class ProfessionalScheduleModule {}

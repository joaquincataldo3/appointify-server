import { Module } from '@nestjs/common';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { ProfessionalScheduleModule } from 'src/professional_schedule/professional_schedule.module';

@Module({
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  imports: [ProfessionalScheduleModule]
})
export class AppointmentsModule {}

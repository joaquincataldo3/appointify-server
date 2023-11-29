import { Module } from '@nestjs/common';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';

@Module({
  providers: [AppointmentsService],
  controllers: [AppointmentsController]
})
export class AppointmentsModule {}

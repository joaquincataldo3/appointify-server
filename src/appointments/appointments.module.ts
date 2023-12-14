import { Module } from '@nestjs/common';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { ProfessionalScheduleModule } from 'src/professional_schedule/professional_schedule.module';
import { JwtModule } from '@nestjs/jwt';
import { TokensBlacklistModule } from 'src/tokens_blacklist/tokens_blacklist.module';
import { YearDaysModule } from 'src/year_days/year_days.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  imports: [ProfessionalScheduleModule, TokensBlacklistModule, YearDaysModule, UsersModule, JwtModule.register({})]
})
export class AppointmentsModule {}

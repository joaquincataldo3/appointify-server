import { Module } from '@nestjs/common';
import { HoursModule } from './hours/hours.module';
import { UserRolesModule } from './user_roles/user_roles.module';
import { UsersModule } from './users/users.module';
import { YearDaysModule } from './year_days/year_days.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [HoursModule, UserRolesModule, UsersModule, YearDaysModule, AppointmentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

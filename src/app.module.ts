import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { HoursModule } from './hours/hours.module';
import { UserRolesModule } from './user_roles/user_roles.module';
import { UsersModule } from './users/users.module';
import { YearDaysModule } from './year_days/year_days.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AppointmenService } from './ts/appointmen/appointmen.service';

@Module({
  imports: [ClientsModule, HoursModule, UserRolesModule, UsersModule, YearDaysModule, AppointmentsModule],
  controllers: [],
  providers: [AppointmenService],
})
export class AppModule {}

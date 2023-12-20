import { Module } from '@nestjs/common';
import { UserRolesModule } from './user_roles/user_roles.module';
import { UsersModule } from './users/users.module';
import { YearDaysModule } from './year_days/year_days.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TokensBlacklistModule } from './tokens_blacklist/tokens_blacklist.module';
import { ConfigModule } from '@nestjs/config';
import { ProfessionalScheduleModule } from './professional_schedule/professional_schedule.module';
import { ProfessionalHoursModule } from './hours/professional_hours.module';
import { DayOfTheWeekModule } from './day_of_the_week/day_of_the_week.module';
import { WelcomeModule } from './welcome/welcome.module';


@Module({
  imports: [ProfessionalHoursModule, UserRolesModule, UsersModule, YearDaysModule, AppointmentsModule, DatabaseModule, AuthModule, TokensBlacklistModule, ProfessionalScheduleModule, ConfigModule.forRoot({isGlobal: true}), DayOfTheWeekModule, WelcomeModule ],
  controllers: [],
  providers: [],
})
export class AppModule {}

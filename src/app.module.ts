import { Module } from '@nestjs/common';
import { HoursModule } from './hours/hours.module';
import { UserRolesModule } from './user_roles/user_roles.module';
import { UsersModule } from './users/users.module';
import { YearDaysModule } from './year_days/year_days.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TokensBlacklistModule } from './tokens_blacklist/tokens_blacklist.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [HoursModule, UserRolesModule, UsersModule, YearDaysModule, AppointmentsModule, DatabaseModule, AuthModule, TokensBlacklistModule, ConfigModule.forRoot({isGlobal: true})],
  controllers: [],
  providers: [],
})
export class AppModule {}

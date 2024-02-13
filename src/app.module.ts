import { Module } from '@nestjs/common';
import { UserRolesModule } from './user_roles/user_roles.module';
import { UsersModule } from './users/users.module';
import { YearDaysModule } from './year_days/year_days.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TokensBlacklistModule } from './tokens_blacklist/tokens_blacklist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfessionalScheduleModule } from './professional_schedule/professional_schedule.module';
import { ProfessionalHoursModule } from './hours/professional_hours.module';
import { DayOfTheWeekModule } from './day_of_the_week/day_of_the_week.module';
import { WelcomeModule } from './welcome/welcome.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MyMailerModule } from './my-mailer/my-mailer.module';


@Module({
  imports: [ProfessionalHoursModule, 
    UserRolesModule, UsersModule, YearDaysModule, 
    AppointmentsModule, DatabaseModule, AuthModule, 
    TokensBlacklistModule, ProfessionalScheduleModule, 
    DayOfTheWeekModule, WelcomeModule, 
    ConfigModule.forRoot({isGlobal: true}),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Importa ConfigModule para poder utilizar ConfigService
      useFactory: async (configService) => ({
        transport: {
          host: 'smtp.gmail.com',
          auth: {
            user: configService.get('MAILER_USER'), // Accede a process.env.MAIL_USER
            pass: configService.get('MAILER_PASSWORD'), // Accede a process.env.MAIL_PASSWORD
          },
          secure: false
        },
      }),
      inject: [ConfigService], // Inyecta ConfigService
    }),
    MailerModule,
    MyMailerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

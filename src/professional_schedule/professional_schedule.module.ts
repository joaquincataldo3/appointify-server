import { Module } from '@nestjs/common';
import { ProfessionalScheduleController } from './controller/professional_schedule.controller';
import { ProfessionalScheduleService } from './service/professional_schedule.service';
import { UsersModule } from 'src/users/users.module';
import { TokensBlacklistModule } from 'src/tokens_blacklist/tokens_blacklist.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  controllers: [ProfessionalScheduleController],
  providers: [ProfessionalScheduleService],
  imports: [UsersModule, TokensBlacklistModule, JwtModule.register({})],
  exports: [ProfessionalScheduleService]
})
export class ProfessionalScheduleModule {}

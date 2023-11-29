import { Module } from '@nestjs/common';
import { YearDaysService } from './year_days.service';
import { YearDaysController } from './year_days.controller';

@Module({
  providers: [YearDaysService],
  controllers: [YearDaysController]
})
export class YearDaysModule {}

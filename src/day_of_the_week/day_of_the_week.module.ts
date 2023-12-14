import { Module } from '@nestjs/common';
import { DayOfTheWeekService } from './service/day_of_the_week.service';

@Module({
  providers: [DayOfTheWeekService]
})
export class DayOfTheWeekModule {}

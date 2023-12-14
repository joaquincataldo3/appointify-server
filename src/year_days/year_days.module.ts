import { Module } from '@nestjs/common';
import { YearDaysService } from './services/year_days.service';
import { YearDaysController } from './controllers/year_days.controller';

@Module({
  providers: [YearDaysService],
  controllers: [YearDaysController],
  exports: [YearDaysService]
})
export class YearDaysModule {}

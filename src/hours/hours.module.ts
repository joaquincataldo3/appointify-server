import { Module } from '@nestjs/common';
import { HoursService } from './hours.service';
import { HoursController } from './controllers/hours.controller';

@Module({
  providers: [HoursService],
  controllers: [HoursController]
})
export class HoursModule {}

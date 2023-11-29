import { Module } from '@nestjs/common';
import { HoursService } from './services/hours.service';
import { HoursController } from './controllers/hours.controller';

@Module({
  providers: [HoursService],
  controllers: [HoursController]
})
export class HoursModule {}

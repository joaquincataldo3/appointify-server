import { Module } from '@nestjs/common';
import { WelcomeController } from './controllers/welcome.controller';
import { WelcomeService } from './services/welcome.service';

@Module({
  controllers: [WelcomeController],
  providers: [WelcomeService]
})
export class WelcomeModule {}

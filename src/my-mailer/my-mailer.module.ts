import { Module } from '@nestjs/common';
import { MyMailerService } from './service/my-mailer.service';

@Module({
  providers: [MyMailerService]
})
export class MyMailerModule {}

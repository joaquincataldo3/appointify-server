import { Module } from '@nestjs/common';
import { MyMailerService } from './service/my-mailer.service';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [MyMailerService],
  imports: [UsersModule],
  exports: [MyMailerService]
})
export class MyMailerModule {}

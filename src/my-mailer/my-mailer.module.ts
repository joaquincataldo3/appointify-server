import { Module } from '@nestjs/common';
import { MyMailerService } from './service/my-mailer.service';
import { UsersService } from 'src/users/services/users.service';

@Module({
  providers: [MyMailerService],
  imports: [UsersService],
  exports: [MyMailerService]
})
export class MyMailerModule {}

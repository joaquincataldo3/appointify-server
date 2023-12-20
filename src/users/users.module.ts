import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { JwtModule } from '@nestjs/jwt';
import { TokensBlacklistModule } from 'src/tokens_blacklist/tokens_blacklist.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [JwtModule.register({}), TokensBlacklistModule]
})
export class UsersModule {}

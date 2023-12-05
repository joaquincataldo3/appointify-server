import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './service/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokensBlacklistModule } from 'src/tokens_blacklist/tokens_blacklist.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsersModule, TokensBlacklistModule, JwtModule.register({}),]
})
export class AuthModule {}

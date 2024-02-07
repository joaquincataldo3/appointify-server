import { Module } from '@nestjs/common';
import { UserRolesService } from './services/user_roles.service';
import { UserRolesController } from './controllers/user_roles.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokensBlacklistModule } from 'src/tokens_blacklist/tokens_blacklist.module';

@Module({
  providers: [UserRolesService],
  controllers: [UserRolesController],
  imports: [JwtModule.register({}), TokensBlacklistModule]
})
export class UserRolesModule {}

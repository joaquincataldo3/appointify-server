import { Module } from '@nestjs/common';
import { UserRolesService } from './services/user_roles.service';
import { UserRolesController } from './controllers/user_roles.controller';

@Module({
  providers: [UserRolesService],
  controllers: [UserRolesController]
})
export class UserRolesModule {}

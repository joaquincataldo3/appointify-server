import { Body, Controller, Get, InternalServerErrorException, Post, UseGuards} from '@nestjs/common';
import { UserRolesService } from '../services/user_roles.service';
import { CreateRoleDto } from '../dto/dto';
import { serverErrorReturn } from 'src/utils/constants/global/global.constants';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';

@ApiTags('User Roles')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)

@Controller('user-roles')
export class UserRolesController {

    constructor(private usersRoleService: UserRolesService) {}

    @Get('/all')
    async getRoles() {
        try {
            return await this.usersRoleService.getAllRoles();
        } catch (error) {
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }
    

}

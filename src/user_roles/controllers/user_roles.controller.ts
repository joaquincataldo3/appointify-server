import { Body, Controller, Get, InternalServerErrorException, Post} from '@nestjs/common';
import { UserRolesService } from '../services/user_roles.service';
import { CreateRoleDto } from '../dto/dto';
import { serverErrorReturn } from 'src/utils/constants/global/global.constants';
import { BatchPayload } from 'src/utils/global-interfaces/global.interfaces';

@Controller('user-roles')
export class UserRolesController {

    constructor(private usersRoleService: UserRolesService) {}

    @Get('/all')
    async getRoles() {
        try {
            return await this.usersRoleService.getAllRoles();
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }

    @Post('/create')
    async createRole(@Body() dto: CreateRoleDto[]): Promise<BatchPayload> {
        try {
            return await this.usersRoleService.createRole(dto);
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }
    

}

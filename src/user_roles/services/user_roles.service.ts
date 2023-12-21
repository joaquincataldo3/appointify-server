import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/dto';
import { DatabaseService } from 'src/database/services/database.service';
import { BatchPayload } from 'src/utils/global-interfaces/global.interfaces';

@Injectable()
export class UserRolesService {

    constructor(private databaseService: DatabaseService) {}

    async getAllRoles() {
        try {
            return await this.databaseService.user_Role.findMany();
        } catch (error) {
            throw error;
        }
    }

   
}

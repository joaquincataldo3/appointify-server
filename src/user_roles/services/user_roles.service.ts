import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database.service';


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

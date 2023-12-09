import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { GetUserParam } from '../interfaces/interfaces';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {

    constructor (private usersService: UsersService) {}

    @Get('all')
    allUsers() {
        return this.usersService.allUsers()
    }

    @Get(':userId')
    oneUser(@Param() params: GetUserParam): Promise<User | null> {
        const userId = params.userId;
        return this.usersService.getUserById(userId);
    }

}

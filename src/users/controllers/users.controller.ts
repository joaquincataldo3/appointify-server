import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { GetUserParam } from '../interfaces/interfaces';
import { User } from '@prisma/client';
import { userIdParam } from 'src/utils/constants/global/global.constants';

@Controller('users')
export class UsersController {

    constructor (private usersService: UsersService) {}

    @Get(`:${userIdParam}`)
    oneUser(@Param(userIdParam, ParseIntPipe) userId: number): Promise<User | null> {
        return this.usersService.getUserById(userId);
    }

}

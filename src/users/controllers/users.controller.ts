import { Controller, Get, Param, ParseIntPipe, UseGuards, Put, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '@prisma/client';
import { serverErrorReturn, userIdParam } from 'src/utils/constants/global/global.constants';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { IsSameUserGuard } from 'src/auth/guards/authorization/isSameUser.authorization.guard';
import { CreateUserDto } from 'src/auth/dto/dto';


@UseGuards(AuthenticationGuard)
@UseGuards(IsSameUserGuard)

@Controller('users')
export class UsersController {

    constructor (private usersService: UsersService) {}

   
    @Get(`:${userIdParam}`)
    getOneUser(@Param(userIdParam, ParseIntPipe) userId: number): Promise<User | null> {
        return this.usersService.getUserById(userId);
    }

    @Put(`:${userIdParam}`)
    updateOneUser(@Param(userIdParam, ParseIntPipe) userId: number, updateUserDto: CreateUserDto): Promise<User> {
        try {
            return this.usersService.updateUser(userId, updateUserDto);
        } catch (error) {
            if(error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(serverErrorReturn);
        }
        
    }

}

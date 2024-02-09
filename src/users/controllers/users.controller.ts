import { Controller, Get, Param, ParseIntPipe, UseGuards, Put, InternalServerErrorException, NotFoundException, Delete} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '@prisma/client';
import { PrismaNotFoundCode } from 'src/utils/constants/global/global.constants';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { IsSameUserGuard } from 'src/auth/guards/authorization/isSameUser.authorization.guard';
import { CreateUserDto } from 'src/auth/dto/dto';
import { Prisma } from '@prisma/client';
import { RecordNotFoundException } from 'src/utils/custom-exceptions/custom.exceptions';
import { RequestSuccessNoEntity } from 'src/utils/global-interfaces/global.interfaces';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthenticationGuard)
@UseGuards(IsSameUserGuard)
@ApiBearerAuth()

@Controller('users')
export class UsersController {

    constructor (private usersService: UsersService) {}

    @Get('get/:userId')
    getOneUser(@Param('userId', ParseIntPipe) userId: number): Promise<User | null> {
        return this.usersService.getUserById(userId);
    }

    @Put('update/:userId')
    updateOneUser(@Param('userId', ParseIntPipe) userId: number, updateUserDto: CreateUserDto): Promise<User> {
        try {
            return this.usersService.updateUser(userId, updateUserDto);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaNotFoundCode) {
                throw new RecordNotFoundException()
            } 
            throw new InternalServerErrorException('Server error');
        }  
    }

    @Delete('delete/:userId')
    async deleteUser(@Param('userId', ParseIntPipe) userId: number): Promise<RequestSuccessNoEntity> {
        try {
            return await this.usersService.deleteUser(userId);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaNotFoundCode) {
                throw new RecordNotFoundException();
            } 
            throw new InternalServerErrorException('Server error');
        }
    }

}

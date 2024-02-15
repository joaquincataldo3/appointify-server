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
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@UseGuards(AuthenticationGuard)
@ApiBearerAuth()

@Controller('users')
export class UsersController {

    constructor (private usersService: UsersService) {}

    @ApiParam({name: 'userId'})
    @Get('get/:userId')
    getOneUser(@Param('userId', ParseIntPipe) userId: number): Promise<User | null> {
        return this.usersService.getUserById(userId);
    }

    @ApiParam({name: 'firstName'})
    @ApiParam({name: 'lastName'})
    @Get('get/:firstName-:lastName')   
    getOneUserByFirstAndLastName(@Param('firstName') firstName: string, @Param('lastName') lastName: string): Promise<User[]> {
        try {
            return this.usersService.getUserByFirstAndLastName(firstName, lastName);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaNotFoundCode) {
                throw new RecordNotFoundException()
            } 
            throw new InternalServerErrorException('Server error');
        }
    }

    @Put('update/:userId')
    @UseGuards(IsSameUserGuard)
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
    @UseGuards(IsSameUserGuard)
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

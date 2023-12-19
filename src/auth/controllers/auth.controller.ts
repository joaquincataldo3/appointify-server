import { Body, ConflictException, Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { CreateUserDto, UserSignInDto } from '../dto/dto';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { Response } from 'express';
import { GetUserDecorator } from '../../utils/decorators/user/getUser.decorator';
import { RequestUser, UserSignInReturn } from '../interfaces/interfaces';
import { RequestSuccessNoEntity } from 'src/utils/global-interfaces/global.interfaces';
import { serverErrorReturn } from 'src/utils/constants/global/global.constants';


// swagger tag
@ApiTags('Auth')

// prefix
@Controller('auth')
export class AuthController {

    constructor (private authService: AuthService) {}

    @UseGuards(AuthenticationGuard)
    @Get('logout')
    async logout (@Res({passthrough: true}) res: Response, @GetUserDecorator() user: RequestUser): Promise<RequestSuccessNoEntity> {
        try {
            return await this.authService.logout(res, user)
        } catch (error) {
            if(error instanceof NotFoundException) {
                throw error;
            }   
            throw new InternalServerErrorException(serverErrorReturn)
        }
        
    }

    @Post('sign-in')
    async signIn (@Body() signInDto: UserSignInDto, @Res({passthrough: true}) res: Response): Promise<UserSignInReturn> {
        try {
            return await this.authService.signIn(signInDto, res)
        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error;
            } else if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new InternalServerErrorException(serverErrorReturn)
        }
        
    }


    @Post('sign-up')
    @HttpCode(201)
    async signUp (@Body() signUpDto: CreateUserDto): Promise<RequestSuccessNoEntity> {
        try {
            return await this.authService.signUp(signUpDto);
        } catch (error) {
            if(error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException(serverErrorReturn);
        }
        
    }

}

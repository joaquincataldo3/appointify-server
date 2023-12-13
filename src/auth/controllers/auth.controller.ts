import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { SignUpDto, UserSignInDto } from '../dto/dto';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { Response } from 'express';
import { GetUserDecorator } from '../../utils/decorators/user/getUser.decorator';
import { RequestUser, UserSignInReturn } from '../interfaces/interfaces';


// swagger tag
@ApiTags('Auth')

// prefix
@Controller('auth')
export class AuthController {

    constructor (private authService: AuthService) {}

    @UseGuards(AuthenticationGuard)
    @Get('logout')
    async logout (@Res({passthrough: true}) res: Response, @GetUserDecorator() user: RequestUser): Promise<string> {
        return await this.authService.logout(res, user)
    }

    @Post('sign-in')
    async signIn (@Body() signInDto: UserSignInDto, @Res({passthrough: true}) res: Response): Promise<UserSignInReturn> {
        return await this.authService.signIn(signInDto, res)
    }


    @Post('sign-up')
    async signUp (@Body() signUpDto: SignUpDto): Promise<string> {
        console.log(signUpDto);
        return await this.authService.signUp(signUpDto);
        
    }

}

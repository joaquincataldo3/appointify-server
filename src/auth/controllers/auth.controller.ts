import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { LogoutDto, SignUpDto, UserSignInDto } from '../dto/dto';
import {Response} from 'express';

// swagger tag
@ApiTags('Auth')

// prefix
@Controller('auth')
export class AuthController {

    constructor (private authService: AuthService) {}

    @Post('sign-in')
    async signIn (@Body() signInDto: UserSignInDto, @Res({passthrough: true}) res: Response) {
        return await this.authService.signIn(signInDto, res)
    }

    @Post('logout')
    async logout (@Body() logoutDto: LogoutDto, @Res({passthrough: true}) res: Response) {
        return await this.authService.logout(logoutDto, res)
    }

    @Post('sign-up')
    async signUp (@Body() signUpDto: SignUpDto) {
        return await this.authService.signUp(signUpDto);
        
    }

}

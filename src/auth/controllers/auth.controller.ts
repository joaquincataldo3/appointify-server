import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { SignUpDto, UserSignInDto } from '../dto/dto';
import { AuthGuard } from '../guard/auth.guard';
import { Response } from 'express';
import { GetUserDecorator } from '../decorators/getUser.decorator';
import { User } from '@prisma/client';
import { RequestUser } from '../interfaces/interfaces';


// swagger tag
@ApiTags('Auth')

// prefix
@Controller('auth')
export class AuthController {

    constructor (private authService: AuthService) {}

    @UseGuards(AuthGuard)
    @Get('logout')
    async logout (@Res({passthrough: true}) res: Response, @GetUserDecorator() user: RequestUser): Promise<string> {
        return await this.authService.logout(res, user)
    }

    @Post('sign-in')
    async signIn (@Body() signInDto: UserSignInDto, @Res({passthrough: true}) res: Response) {
        return await this.authService.signIn(signInDto, res)
    }


    @Post('sign-up')
    async signUp (@Body() signUpDto: SignUpDto) {
        return await this.authService.signUp(signUpDto);
        
    }

}

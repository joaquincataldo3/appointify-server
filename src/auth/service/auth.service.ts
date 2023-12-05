import { ConflictException, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LogoutDto, SignUpDto, UserSignInDto } from '../dto/dto';
import { UsersService } from 'src/users/services/users.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignTokenInterface } from '../interfaces/interfaces';
import { Response, Request } from 'express';
import { TokensBlacklistService } from 'src/tokens_blacklist/services/tokens_blacklist.service';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private tokenBlacklistService: TokensBlacklistService,
        private databaseService: DatabaseService
    ) { }

    private cookieName = 'access_token';

    async signToken(signTokenObject: SignTokenInterface): Promise<string> {

        try {
            const secret = this.configService.get<string>('SECRET_SESSION');
            // devuelve un token
            return await this.jwtService.signAsync(signTokenObject, {
                expiresIn: '1h',
                secret
            });
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Error in signToken')
        }

    }


    async signUp(signUpDto: SignUpDto): Promise<User> {

        const { username, email, password } = signUpDto;
        const userExists = await this.usersService.getUserByField(username);
        if (userExists.length > 0) {
            throw new ConflictException('The user already exists in the database')
        }
        const emailExists = await this.usersService.getUserByField(email);
        if (emailExists.length > 0) {
            throw new ConflictException('The email already exists in the database')
        }
        try {
            const hashedPassword = await hash(password, 10);
            signUpDto.password = hashedPassword;
            const userCreated = await this.databaseService.user.create({
                data: signUpDto
            });
            return userCreated;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in signUp: ${error}`)
        }

    }

    async signIn(signInDto: UserSignInDto, res: Response) {

        const { email, password } = signInDto;
        const user = await this.usersService.getUserByField(email);
        // not found exception handled in userservice function
        try {
            const userFound = user[0];
            const passwordMatches = await compare(password, userFound.password);
            if (!passwordMatches) {
                throw new UnauthorizedException("Passwords don't match")
            }
            const { username, id } = userFound;
            const signTokenObject: SignTokenInterface = {
                email,
                username,
                id
            }
            const token: string = await this.signToken(signTokenObject);
            res.cookie(this.cookieName, { ...signTokenObject, token }, { maxAge: 3600000 });
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in signIn: ${error}`)
        }


    }

    async logout(logoutDto: LogoutDto, res: Response, context: ExecutionContext): Promise<boolean> {
        // we access to the request object
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const { token } = logoutDto;
        const { id } = user;
        const createTokenInBlacklist = {
            tokenToCreate: token,
            userId: id
        }
        await this.tokenBlacklistService.deleteTokenAssociatedWithUser(id);
        await this.tokenBlacklistService.createToken(createTokenInBlacklist);
        res.clearCookie(this.cookieName);
        return true;
    }

}

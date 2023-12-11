import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignUpDto, UserSignInDto } from '../dto/dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequestUser, SignTokenInterface, UserSignInReturn } from '../interfaces/interfaces';
import { Response, Request } from 'express';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/services/users.service';
import { TokensBlacklistService } from 'src/tokens_blacklist/services/tokens_blacklist.service';
import { DatabaseService } from 'src/database/services/database.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private tokenBlacklistService: TokensBlacklistService,
        private databaseService: DatabaseService,
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
        const {user_role_id, ...rest} = signUpDto;
        const copySignUpWithoutRole = {
            ...rest
        }
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
                data: {
                    ...copySignUpWithoutRole,
                    userRole: {
                        connect: {
                            id: user_role_id
                        }
                    }
                }
            });
            return userCreated;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in signUp: ${error}`)
        }

    }

    async signIn(signInDto: UserSignInDto, res: Response): Promise<UserSignInReturn> {

        const { email, password } = signInDto;
        const user = await this.usersService.getUserByField(email);
        // not found exception handled in userservice function
        try {
            const userFound = user[0];
            const passwordMatches = await compare(password, userFound.password);
            if (!passwordMatches) {
                throw new UnauthorizedException("Passwords don't match")
            }
            const { username, id, first_name, last_name, user_role_id } = userFound;
            const signTokenObject: SignTokenInterface = {
                email,
                username,
                id
            }
            const token = await this.signToken(signTokenObject);
            res.cookie(this.cookieName, { ...signTokenObject, token }, { maxAge: 3600000 });
            const userSignInReturn: UserSignInReturn = {
                email,
                username,
                id,
                token,
                user_role_id,
                first_name,
                last_name
            }
            return userSignInReturn
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in signIn: ${error}`)
        }


    }

    async logout(res: Response, user: RequestUser): Promise<string> {
        // we access to the request object
        const { id, token } = user;
        const createTokenInBlacklist = {
            tokenToCreate: token,
            userId: id
        }
        await this.tokenBlacklistService.deleteTokenAssociatedWithUser(id);
        await this.tokenBlacklistService.createToken(createTokenInBlacklist);
        res.clearCookie(this.cookieName);
        return "You've been logged out";
    }

}

import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto, UserSignInDto } from '../dto/dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequestUser, SignTokenInterface, UserSignInReturn } from '../interfaces/interfaces';
import { Response, Request } from 'express';
import { UsersService } from 'src/users/services/users.service';
import { TokensBlacklistService } from 'src/tokens_blacklist/services/tokens_blacklist.service';
import { DatabaseService } from 'src/database/services/database.service';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { RequestSuccessNoEntity } from 'src/utils/global-interfaces/global.interfaces';

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
            throw new InternalServerErrorException('Error in signToken')
        }

    }

    async signUp(createUserDto: CreateUserDto): Promise<RequestSuccessNoEntity> {
        try {
            const { user_role_id, ...rest } = createUserDto;
            const usernameWithNoCapitalLetters = rest.username.toLowerCase();
            const emailWithNoCapitalLetters = rest.email.toLowerCase();
            const userExists = await this.usersService.getUserByField(usernameWithNoCapitalLetters);
            if (userExists.length > 0) {
                throw new ConflictException('The user already exists in the database')
            }
            const emailExists = await this.usersService.getUserByField(emailWithNoCapitalLetters);
            if (emailExists.length > 0) {
                throw new ConflictException('The email already exists in the database')
            }

            const hashedPassword = await hash(rest.password, 10);
            rest.password = hashedPassword;
            await this.databaseService.user.create({
                data: {
                    ...rest,
                    userRole: {
                        connect: {
                            id: user_role_id
                        }
                    }
                }
            });
            return { ok: true };
        } catch (error) {
            throw error;
        }
    }

    async signIn(signInDto: UserSignInDto, res: Response): Promise<UserSignInReturn> {
        const { email, password } = signInDto;
        const emailWithNoCapitalLetters = email.toLowerCase();

        const userEmailExists = await this.usersService.getUserByField(emailWithNoCapitalLetters);
        if (userEmailExists.length === 0) {
            throw new NotFoundException('Invalid credentials');
        }
        const userFound = userEmailExists[0];
        const passwordMatches = await compare(password, userFound.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials')
        }
        const { username, id, first_name, last_name, user_role_id } = userFound;
        const signTokenObject: SignTokenInterface = {
            email,
            username,
            id,
            user_role_id
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
    }

    @UseGuards(AuthenticationGuard)
    async logout(res: Response, user: RequestUser): Promise<RequestSuccessNoEntity> {
        // we access to the request object
        const { id, token } = user;
        const createTokenInBlacklist = {
            tokenToCreate: token,
            userId: id
        }
        await this.tokenBlacklistService.deleteTokenAssociatedWithUser(id);
        await this.tokenBlacklistService.createToken(createTokenInBlacklist);
        res.clearCookie(this.cookieName);
        return { ok: true };
    }

}

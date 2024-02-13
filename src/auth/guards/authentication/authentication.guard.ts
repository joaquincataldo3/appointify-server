import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokensBlacklistService } from 'src/tokens_blacklist/services/tokens_blacklist.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private tokenBlacklistService: TokensBlacklistService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // obtiene objeto de solicitud actual  
        const request = context.switchToHttp().getRequest();
        // extrae el token del objeto del request
        const token = this.extractTokenFromHeader(request);
        // si no está devolvemos unauthorized
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configService.get('SECRET_SESSION')
                }
            );
            const isTokenInBlacklist = await this.tokenBlacklistService.findToken(token);
            // si está en la blacklist devolvemos unauthorized
            if (isTokenInBlacklist) {
                throw new UnauthorizedException()
            } 
            request['user'] = {...payload, token};
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
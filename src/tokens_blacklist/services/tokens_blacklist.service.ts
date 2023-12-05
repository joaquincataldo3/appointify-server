import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TokenBlacklist } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';


@Injectable()
export class TokensBlacklistService {

    constructor (private databaseService: DatabaseService) {}

    async findToken(tokenToFind: string): Promise<boolean> {
        const token = await this.databaseService.tokenBlacklist.findFirst({
            where: {
              token:  tokenToFind
            },
        })
        if (!token) return false;
        return true;
    }

    async createToken(tokenToCreate: string): Promise<TokenBlacklist> {
        try {
            const currentDate = new Date();
            const token = await this.databaseService.tokenBlacklist.create({
                data: {
                    token: tokenToCreate,
                    expiry_date: currentDate
                }
            });
            return token
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Internal error in createToken')
        }
        
    }
}

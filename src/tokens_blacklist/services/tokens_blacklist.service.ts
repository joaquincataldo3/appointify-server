import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TokenBlacklist } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';
import { CreateTokenBlacklist } from '../interfaces/interfaces';
import { Prisma } from '@prisma/client';
import { schedule } from 'node-cron';


@Injectable()
export class TokensBlacklistService {

    constructor (private databaseService: DatabaseService) {
        // every 7 days we execute this
        schedule('0 0 */7 * *', async () => {
            await this.getAndDeleteAllExpiredTokens()
        })
    }


    async getAndDeleteAllExpiredTokens() {
       const tokens = await this.databaseService.tokenBlacklist.findMany();
       const currentDate = new Date();
       for(let i = 0; i < tokens.length; i++) {
            const tokenExpiryDate = new Date(tokens[i].expiry_date);
            if(tokenExpiryDate <  currentDate) {
                const tokenId = tokens[i].id;
                await this.deleteToken(tokenId);
            }
       }
    }

    async findToken(tokenToFind: string): Promise<boolean> {
        const token = await this.databaseService.tokenBlacklist.findFirst({
            where: {
              token:  tokenToFind
            },
        })
        if (!token) return false;
        return true;
    }

    async createToken(createTokenObj: CreateTokenBlacklist): Promise<TokenBlacklist> {
        try {
            const {tokenToCreate, userId} = createTokenObj;
            const currentDate = new Date();
            const token = await this.databaseService.tokenBlacklist.create({
                data: {
                    token: tokenToCreate,
                    expiry_date: currentDate,
                    user_id: userId
                }
            });
            return token
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Internal error in createToken')
        }
    }

    async deleteToken(tokenId: number) {
        try {
            await this.databaseService.tokenBlacklist.delete({
                where: {
                    id: tokenId
                }
            })
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Error in deleteToken')
        }
    }

    async deleteTokenAssociatedWithUser(userId: number): Promise<Prisma.BatchPayload> {
        try {
            const countOfDeletedTokens = await this.databaseService.tokenBlacklist.deleteMany({
                where: {
                    user_id: userId
                }
            })
            return countOfDeletedTokens;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Error in delete token associated with user')   
        }
        
    }

}

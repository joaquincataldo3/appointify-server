import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';

@Injectable()
export class UsersService {

    constructor(private databaseService: DatabaseService) {}

    allUsers() {
        return "All users !"
    }

    async getUserById(userId: number): Promise<User | null>{
        console.log(userId)
        const userExists = await this.databaseService.user.findUnique({
            where: {
                id: userId
            }
        })
        console.log(userExists);
        if (!userExists) {
            return null;
        }
        return userExists;
    }
    
    async getUserByField(value: string): Promise<User[] | []> {
        const userExists = await this.databaseService.user.findMany({
            where: {
                OR: [
                    { email: value },
                    { username: value }
                ] 
            }
        })
       
        if (!userExists) {
            return [];
        }
      
        return userExists;
    }
    

}

import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { CreateUserDto } from 'src/auth/dto/dto';
import { DatabaseService } from 'src/database/services/database.service';
import { RequestSuccessNoEntity } from 'src/utils/global-interfaces/global.interfaces';


@Injectable()
export class UsersService {

    constructor(private databaseService: DatabaseService) { }

    async getUserById(userId: number): Promise<User | null> {

        const userExists = await this.databaseService.user.findUnique({
            where: {
                id: userId
            },
            include: {
                professionalAppointments: true,
                clientAppointments: true,
                schedule: true
            }
        })
        if (!userExists) {
            return null;
        }
        let user = userExists;
        if(user.user_role_id === 1) {
            delete user.clientAppointments;
        } else {
            delete user.professionalAppointments;
            delete user.schedule;
        }
        return user;
    }

    async getUserByField(value: string): Promise<User[] | []> {
        try {
            const userExists = await this.databaseService.user.findMany({
                where: {
                    OR: [
                        { email: value },
                        { username: value }
                    ]
                },
                include: {
                    professionalAppointments: true,
                    clientAppointments: true,
                    schedule: true
                }
            })
            if (userExists.length === 0) {
                return [];
            }
            let user = userExists[0];
            if(user.user_role_id === 1) {
                delete user.clientAppointments;
            } else {
                delete user.professionalAppointments;
                delete user.schedule;
            }
            return userExists;
        } catch (error) {
            throw error;
        }
    }

    async getUserByFirstAndLastName(firstName: string, lastName: string): Promise<User[]> {
        try {
            const userExists = await this.databaseService.user.findMany({
                where: {
                    AND: [
                        {first_name: firstName},
                        {last_name: lastName}
                    ]     
                 },
                include: {
                    professionalAppointments: true,
                    clientAppointments: true,
                    schedule: true
                }
            })
            if (userExists.length === 0) {
                throw new NotFoundException('User not found');
            }
            let user = userExists[0];
            if(user.user_role_id === 1) {
                delete user.clientAppointments;
            } else {
                delete user.professionalAppointments;
                delete user.schedule;
            }
            return userExists;
        } catch (error) {
            throw error;
        }
    }

    async updateUser(userId: number, updateUserDto: CreateUserDto): Promise<User>{
        try {
            const updatedUser = await this.databaseService.user.update({
                where: {
                    id: userId
                },
                data: updateUserDto
            })
            return updatedUser;
        } catch (error) {
            throw error;
        }
        
    }

    async deleteUser(userId: number): Promise<RequestSuccessNoEntity> {
        try {
            await this.databaseService.user.delete({
                where: {
                    id: userId
                }
            })
            return { ok: true }
        } catch (error) {
            throw error;
        }
    }

}

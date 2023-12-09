import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProfessionalSchedule } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';
import { UsersService } from 'src/users/services/users.service';
import { ProfessionalScheduleBody,Schedule } from '../dto/dto';

@Injectable()
export class ProfessionalScheduleService {

    constructor (
        private databaseService: DatabaseService,
        private usersService: UsersService
        ) {}
        

    async getProfessionalSchedule(professionalId: number): Promise<ProfessionalSchedule[]> {
        try {
            const professionalExists = await this.usersService.getUserById(professionalId);
            if (!professionalExists) {
                throw new NotFoundException(`User does not exists with id: ${professionalId}`)
            }
            const professionalSchedules = await this.databaseService.professionalSchedule.findMany({
                where: {
                    professional_id: professionalId
                }
            })
            return professionalSchedules;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in getProfessionalSchedule: ${error}`);
        }
       
    }

    async createSchedule (createScheduleBody: ProfessionalScheduleBody[]) {
        let schedulesCreated: Schedule[] | null = null;
        try {
            for (let i = 0; i < createScheduleBody.length; i++) {
                const professionalId = createScheduleBody[i].professional_id;
                const weekDayId = createScheduleBody[i].week_day_id;
                const startTime= createScheduleBody[i].start_time;
                const endTime = createScheduleBody[i].end_time;
                const breakTimeStart = createScheduleBody[i].break_time_start;
                const breakTimeStop = createScheduleBody[i].break_time_stop;
                const work = await this.databaseService.professionalSchedule.create({
                    data: {
                        professional: {connect: { id: professionalId } },
                        weekDay: { connect: { id: weekDayId } },
                        start_time: startTime,
                        end_time: endTime,
                        break_time_start: breakTimeStart,
                        break_time_stop: breakTimeStop
                    }
                })

                schedulesCreated.push(work);
            }
            return schedulesCreated;
        } catch (error) {
            console.log(error);
            // we do a rollback if an error ocurs
            for(let i = 0; i < schedulesCreated.length; i++) {
                const ScheduleId = schedulesCreated[i].id;
                await this.deleteSchedule(ScheduleId);
            }
            throw new InternalServerErrorException(`Error in createSchedule: ${error}`);
        }
    }

    async deleteSchedule (ScheduleId: number) {
        try {
            await this.databaseService.professionalSchedule.delete({
                where: {
                    id: ScheduleId
                }
            });
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in deleteSchedule: ${error}`);
        }
    }

}

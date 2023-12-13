import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProfessionalSchedule } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';
import { UsersService } from 'src/users/services/users.service';
import { ProfessionalScheduleBody, Schedule } from '../dto/dto';
import { CustomValuesConflict } from 'src/utils/custom-exceptions/custom.exceptions';

@Injectable()
export class ProfessionalScheduleService {

    constructor(
        private databaseService: DatabaseService,
        private usersService: UsersService
    ) { }


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

    async createSchedule(createScheduleBody: ProfessionalScheduleBody[]) {
        let schedulesCreated: Schedule[] | null = null;
        try {
            for (let i = 0; i < createScheduleBody.length; i++) {
                const { professional_id, week_day_id, ...rest } = createScheduleBody[i];
                if (rest.start_time >= rest.end_time || rest.break_time_start >= rest.break_time_stop) {
                    throw new CustomValuesConflict('Time intervals no valid');
                }
                const isIdCorrect = await this.usersService.getUserById(professional_id);
                if (!isIdCorrect) {
                    throw new NotFoundException(`Professional not found with id: ${professional_id}`);
                }
                const work = await this.databaseService.professionalSchedule.create({
                    data: {
                        professional: { connect: { id: professional_id } },
                        weekDay: { connect: { id: week_day_id } },
                        ...rest
                    }
                })
                schedulesCreated.push(work);
            }
            return schedulesCreated;
        } catch (error) {
            console.log(error);
            // we do a rollback if an error ocurs
            for (let i = 0; i < schedulesCreated.length; i++) {
                const { id } = schedulesCreated[i];
                await this.deleteSchedule(id);
            }

            if (error instanceof NotFoundException) {
                throw error; 
            } else if (error instanceof CustomValuesConflict) {
                throw error; 
            }


            throw new InternalServerErrorException(`Internal server error in createSchedule: ${error}`);
        }
    }


    async deleteSchedule(ScheduleId: number) {
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

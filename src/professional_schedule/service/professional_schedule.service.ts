import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProfessionalSchedule } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';
import { UsersService } from 'src/users/services/users.service';
import { ProfessionalScheduleInBody } from '../dto/dto';
import { CustomValuesConflict } from 'src/utils/custom-exceptions/custom.exceptions';
import { Schedule } from '../interfaces/interfaces';
import { BatchPayload, RequestSuccessNoEntity } from 'src/utils/global-interfaces/global.interfaces';

@Injectable()
export class ProfessionalScheduleService {

    constructor(
        private databaseService: DatabaseService,
        private usersService: UsersService,
    ) { }

    private schedulesCreated: Schedule = {
        professional_id: null,
        schedule: []
    };

    async getProfessionalSchedule(professionalId: number, weekDayId?: number): Promise<ProfessionalSchedule[] | boolean> {
        try {
            let professionalSchedule: ProfessionalSchedule[];
            // podemos filtrar por día, si no devuelve el schedule entero

            if (weekDayId) {
                professionalSchedule = await this.databaseService.professionalSchedule.findMany({
                    where: {
                        professional_id: professionalId,
                        day_of_the_week_id: weekDayId
                    },
                    include: {
                        weekDay: true,
                        professional: {
                            select: {
                                id: true,
                                username: true,
                                first_name: true,
                                email: true
                            }
                        }
                    }
                })
            } else {
                professionalSchedule = await this.databaseService.professionalSchedule.findMany({
                    where: {
                        professional_id: professionalId
                    },
                    include: {
                        weekDay: true,
                        professional: {
                            select: {
                                id: true,
                                username: true,
                                first_name: true,
                                email: true
                            }
                        }
                    }
                })
            }
            if (professionalSchedule.length === 0) {
                return false
            }
            return professionalSchedule;
        } catch (error) {
            

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(`Error in getProfessionalSchedule: ${error}`);
        }

    }

    async getScheduleByWeekDay(day_of_the_week_id: number) {
        try {
            const scheduleOfTheDay = await this.databaseService.professionalSchedule.findFirst({
                where: {
                    day_of_the_week_id
                },
                include: {
                    weekDay: true
                }
            });
            return scheduleOfTheDay;
        } catch (error) {
            throw new InternalServerErrorException();
        }
       
    }

    async createSchedule(createScheduleBody: ProfessionalScheduleInBody, professionalId: number): Promise<Schedule> {
        try {
                this.schedulesCreated.professional_id = professionalId;
                const schedule = createScheduleBody.schedule;
                for (let i = 0; i < schedule.length; i++) {
                    const { week_day_id, ...rest } = schedule[i];
                    
                    if (rest.start_time >= rest.end_time || rest.break_time_start >= rest.break_time_stop) {
                        throw new CustomValuesConflict('Time intervals no valid');
                    }
                    const isIdCorrect = await this.usersService.getUserById(professionalId);
                    
                    if (!isIdCorrect) {
                        throw new NotFoundException(`Professional not found with id: ${professionalId}`);
                    }
                    const isAlreadyAnScheduleForTheDay = await this.getScheduleByWeekDay(week_day_id);
                    if(isAlreadyAnScheduleForTheDay) {
                        const day = isAlreadyAnScheduleForTheDay.weekDay.day_name;
                        throw new CustomValuesConflict(`There is already a schedule set up for the day ${day}`)               
                    }
                    const work = await this.databaseService.professionalSchedule.create({
                        data: {
                            professional: { connect: { id: professionalId } },
                            weekDay: { connect: { id: week_day_id } },
                            ...rest
                        }
                    })
                    
                    this.schedulesCreated.schedule.push(work);
                    
                }
            
            return this.schedulesCreated;
        } catch (error) {
            for (let i = 0; i < this.schedulesCreated.schedule.length; i++) {
                const { id } = this.schedulesCreated[i];
                await this.deleteSchedule(id);
            }
            throw error;
        }
    }

    async updateSchedule(professionalId: number, updateScheduleBody: ProfessionalScheduleInBody): Promise<BatchPayload> {
        try {
            const affectedRows = await this.databaseService.professionalSchedule.updateMany({
                where: {
                    professional_id: professionalId
                },
                data: updateScheduleBody
            })
            if(affectedRows.count === 0) {
                throw new NotFoundException('Schedule not found')
            }
            return affectedRows;
        } catch (error) {
            throw error;
        }
       
    }

    async deleteSchedule(ScheduleId: number): Promise<RequestSuccessNoEntity> {
        try {
            const schedule = await this.databaseService.professionalSchedule.delete({
                where: {
                    id: ScheduleId
                }
            });
            if (schedule === null) {
                throw new NotFoundException(`Schedule not found with id: ${ScheduleId}`);
            }
            return { ok: true };
        } catch (error) {
                throw error;
        }
    }

}

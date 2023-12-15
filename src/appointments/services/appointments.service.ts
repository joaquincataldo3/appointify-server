import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/dto';
import { DatabaseService } from 'src/database/services/database.service';
import { Appointment } from '@prisma/client';
import { ProfessionalScheduleService } from 'src/professional_schedule/service/professional_schedule.service';
import { addMinutes, set, getHours, getMinutes} from 'date-fns';
import { AvailableAppointmentsInterface, WorkingHoursInterface } from 'src/professional_schedule/interfaces/interfaces';
import { YearDaysService } from 'src/year_days/services/year_days.service';
import { UsersService } from 'src/users/services/users.service';
import { SetHoursAndMinutes } from '../interfaces/interfaces';


@Injectable()
export class AppointmentsService {

    constructor(
        private databaseService: DatabaseService,
        private professionalScheduleService: ProfessionalScheduleService,
        private yearDaysService: YearDaysService,
        private usersService: UsersService
    ) { }

    async createAppointment(createAppointment: CreateAppointmentDto): Promise<Appointment> {
        try {
            const { user_id, year_day_id, professional_id, ...rest } = createAppointment;
            const newAppointment = await this.databaseService.appointment.create({
                // many to many
                data: {
                    ...rest,
                    client: {
                        connect: { id: user_id }
                    },
                    yearDay: {
                        connect: { id: year_day_id }
                    },
                    professional: {
                        connect: { id: professional_id }
                    }
                }
            });
            return newAppointment;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(`Error in createAppointment: ${error}`);
        }
    }


    isTimeWithinWorkingHours(timeToCheck: Date, workingHoursObj: WorkingHoursInterface): boolean {
        const { start, end } = workingHoursObj
        const time = timeToCheck.getHours() * 60 + timeToCheck.getMinutes();
        const startTime = start.getHours() * 60 + end.getMinutes();
        const endTime = end.getHours() * 60 + end.getMinutes();

        return time >= startTime && time <= endTime;
    }


    isTimeOccupied(start: Date, end: Date, takenAppointments: Appointment[], lunchStart: Date | null, lunchEnd: Date | null): boolean {

        let isDuringLunch: boolean;

        if (lunchStart === null && lunchEnd === null) {
            isDuringLunch = false;
        } else {
            isDuringLunch =
                this.isTimeWithinWorkingHours(start, { start: lunchStart, end: lunchEnd })
                &&
                this.isTimeWithinWorkingHours(end, { start: lunchStart, end: lunchEnd });
        }


        // Si no hay citas, entonces no está ocupado
        if (takenAppointments.length === 0) {
            return isDuringLunch;
        }

        // Verificar superposición con citas existentes
        const isOverlap = takenAppointments.some((appointment) => {
            const apptStart = new Date(appointment.appt_hour_start);
            const apptEnd = new Date(appointment.appt_hour_end);
            const workingHoursObj: WorkingHoursInterface = {
                start: apptStart,
                end: apptEnd
            };

            const isOverlap = this.isTimeWithinWorkingHours(start, workingHoursObj) ||
                this.isTimeWithinWorkingHours(end, workingHoursObj);

            return isOverlap;
        });

        return isDuringLunch || isOverlap;
    }



    async getAvailableAppts(yearDayId: number, professionalId: number): Promise<AvailableAppointmentsInterface[]> {

        try {

            // TODO - CHECK IF EVERYTHING WORKS WITH LUNCH HOURS
            const professionalExists = await this.usersService.getUserById(professionalId);

            if (!professionalExists) {
                throw new NotFoundException(`User does not exists with id: ${professionalId}`)
            }

            const yearDayExists = await this.yearDaysService.getYearDay(yearDayId);

            if (!yearDayExists) {
                throw new NotFoundException(`User does not exists with id: ${yearDayId}`)
            }

            const yearDayDate = yearDayExists.day;

            const dayOfTheWeek = new Date(yearDayDate).getDay();

            const professionalSchedule = await this.professionalScheduleService.getProfessionalSchedule(professionalId, dayOfTheWeek);

            if (!professionalSchedule) {
                throw new NotFoundException(`Professional does not work with in the day with id: ${yearDayId}`)
            }

            const takenAppts = await this.databaseService.appointment.findMany({
                where: {
                    professional_id: professionalId,
                    year_day_id: yearDayId
                }
            })

            const availableAppointments: AvailableAppointmentsInterface[] = [];

            const { start_time, end_time, appt_interval, appt_duration, break_time_start, break_time_stop, professional_id, day_of_the_week_id } = professionalSchedule[0];
           

            const apptDuration = appt_duration; // Duración de la cita en minutos
            const intervalBetweenAppointments = appt_interval;

            // set de date-fns toma dos parametros
            // el día de la fecha original
            // y un objeto que especifica qué campos se deben establecer
            const setStartDayHoursAndMinutes: SetHoursAndMinutes = {
                hours: start_time.getHours(),
                minutes: start_time.getMinutes()
            }

            const setEndDayHoursAndMinutes: SetHoursAndMinutes = {
                hours: end_time.getHours(),
                minutes: end_time.getMinutes()
            } 
            const dayStart = set(yearDayDate, setStartDayHoursAndMinutes);
            const dayEnd = set(yearDayDate, setEndDayHoursAndMinutes);
            let currentTime = new Date(dayStart);

            while (currentTime < dayEnd) {

                // calculamos el inicio de la cita sin tener en cuenta el intervalo
                let endTime = addMinutes(currentTime, apptDuration);

                // nos aseguramos que las horas esten dentro de las working hours del profesional
                const workingHoursObj: WorkingHoursInterface = {
                    start: start_time,
                    end: end_time
                }


                const isBetweenWorkingHours = this.isTimeWithinWorkingHours(currentTime, workingHoursObj);

                // nos aseguramos de que no haya superposición de citas en horarios o que no esté en almuerzo
                const isTimeOccupied = this.isTimeOccupied(currentTime, endTime, takenAppts, break_time_start, break_time_stop)


                // en el caso de que de true la primera y false la segunda, pusheamos
                if (isBetweenWorkingHours && !isTimeOccupied) {
                    const availableApptObj: AvailableAppointmentsInterface = {
                        appt_start_time: currentTime,
                        appt_end_time: endTime,
                        professional_id
                    }
                    availableAppointments.push(availableApptObj);
                }

                // agregamos minutos al current time para inicio de cita
                currentTime = addMinutes(endTime, intervalBetweenAppointments);
            }


            return availableAppointments;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            }

            throw new InternalServerErrorException(`Error in getAvailableAppts: ${error}`)
        }


    }

}

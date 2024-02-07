import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Param } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/dto';
import { DatabaseService } from 'src/database/services/database.service';
import { Appointment, User } from '@prisma/client';
import { ProfessionalScheduleService } from 'src/professional_schedule/service/professional_schedule.service';
import { addMinutes, set } from 'date-fns';
import { AvailableAppointmentsInterface, AppointmentValuesAndCondition, CalculateTimeOccupied } from 'src/auth/interfaces/interfaces';
import { YearDaysService } from 'src/year_days/services/year_days.service';
import { UsersService } from 'src/users/services/users.service';
import { SetHoursAndMinutes } from '../interfaces/interfaces';
import { getSplittedDate } from 'src/utils/functions/dates.functions';
import { CustomValuesConflict } from 'src/utils/custom-exceptions/custom.exceptions';


@Injectable()
export class AppointmentsService {

    constructor(
        private databaseService: DatabaseService,
        private professionalScheduleService: ProfessionalScheduleService,
        private yearDaysService: YearDaysService,
        private usersService: UsersService
    ) { }

    getMinuteDifferenceBetweenHours = (apptStart: Date, apptEnd: Date): number => {
        // Obtener la diferencia en milisegundos entre las dos fechas
        const milisecondsDifference: number = Math.abs(apptEnd.getTime() - apptStart.getTime());

        // Convertir la diferencia a minutos
        const minutesDifference: number = Math.floor(milisecondsDifference / (1000 * 60));
        console.log({diferencia: minutesDifference});

        return minutesDifference;
    }

    async getAppointment(appointmentId: number): Promise<Appointment | null> {
        try {
            const appointment = await this.databaseService.appointment.findUnique({
                where: {
                    id: appointmentId,
                },
                include: {
                    client: {
                        select: {
                            first_name: true,
                            last_name: true,
                            username: true,
                            email: true
                        }
                    },
                    professional: {
                        select: {
                            first_name: true,
                            last_name: true,
                            username: true,
                            email: true
                        }
                    },
                    yearDay: true
                }
            })
            if (!appointment) {
                throw new NotFoundException('Appointment not found')
            }
            return appointment;
        } catch (error) {
            throw error;
        }
    }

    async createAppointment(createAppointment: CreateAppointmentDto): Promise<Appointment> {
        try {
            const { user_id, year_day_id, professional_id, appt_hour_end, appt_hour_start } = createAppointment;
            const startTime = getSplittedDate(appt_hour_start);
            const endTime = getSplittedDate(appt_hour_end);
            // validamos que no haya conflicto de minutos y horas
            const startTimeGreaterThanEndTime = startTime.hour > endTime.hour || (startTime.hour === endTime.hour && startTime.minutes > endTime.minutes);
            if (startTimeGreaterThanEndTime) {
                throw new CustomValuesConflict('La hora de inicio es mayor a la de terminación');
            }
            const yearDay = await this.yearDaysService.getYearDay(year_day_id);
            if(!yearDay) {
                throw new NotFoundException('Día del año no encontrado')
            }
            // agarramos el weekday del year day de la cita
            const dayNumber = this.yearDaysService.getWeekDay(yearDay.day);
            // agarramos el schedule en el día del profesional
            const professionalSchedule = await this.professionalScheduleService.getScheduleByWeekDay(dayNumber);
            if(!professionalSchedule) {
                throw new NotFoundException('Agenda no encontrada')
            }
            // probamos que la diferencia entre las horas sean las mismas que el intervalo del profesional ese día
            const differenceBetweenHours = this.getMinuteDifferenceBetweenHours(appt_hour_start, appt_hour_end);
            const isSameInterval = professionalSchedule.appt_interval !== differenceBetweenHours;
            if(isSameInterval){
                throw new CustomValuesConflict('Los intervalos no son los mismos');
            }
            const newAppointment = await this.databaseService.appointment.create({
                // many to many
                data: {
                    appt_hour_end,
                    appt_hour_start,
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
            throw error;
        }
    }


    isTimeWithinCertainInterval(timeToCheck: Date, workingHoursObj: AppointmentValuesAndCondition): boolean {
        const { start, end } = workingHoursObj

        // convertimos las horas a minutos
        const time = timeToCheck.getHours() * 60 + timeToCheck.getMinutes();

        // Convertimos la hora de inicio a minutos
        const startTime = start.getHours() * 60 + end.getMinutes();

        // Convertimos la hora de finalización (5:00 PM) a minutos
        const endTime = end.getHours() * 60 + end.getMinutes();

        return time >= startTime && time <= endTime;
    }


    isTimeOccupied(timeOccupiedObj: CalculateTimeOccupied): boolean {

        const { currentTime, endDay, takenAppts, lunchStart, lunchEnd } = timeOccupiedObj

        let isDuringLunch: boolean;

        if (lunchStart === null && lunchEnd === null) {
            isDuringLunch = false;
        } else {
            isDuringLunch =
                this.isTimeWithinCertainInterval(currentTime, { start: lunchStart, end: lunchEnd })
                &&
                this.isTimeWithinCertainInterval(endDay, { start: lunchStart, end: lunchEnd });
        }


        // Si no hay citas, entonces no está ocupado
        if (takenAppts.length === 0) {
            return isDuringLunch;
        }
       

        // Verificar superposición con citas existentes
        const isOverlap = takenAppts.some((appointment) => {
            const apptStart = new Date(appointment.appt_hour_start);
            const apptEnd = new Date(appointment.appt_hour_end);
        
            const apptStartMinutes = apptStart.getHours() * 60 + apptStart.getMinutes();
            const apptEndMinutes = apptEnd.getHours() * 60 + apptEnd.getMinutes();
            const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
            // Verificar si currentTime está dentro del intervalo de la cita
            const isWithinInterval = (currentTimeMinutes > apptStartMinutes && currentTimeMinutes < apptEndMinutes) || (apptStartMinutes <= currentTimeMinutes && apptEndMinutes >= currentTimeMinutes);
        
            // Verificar si currentTime coincide exactamente con el inicio o final de la cita
            const isExactStart = currentTime.getTime() === apptStart.getTime();
            const isExactEnd = currentTime.getTime() === apptEnd.getTime();
        
            const isOverlap = isWithinInterval || isExactStart || isExactEnd;

            console.log({apptStart: apptStart})
            console.log({apptEnd: apptEnd})
            console.log({apptcurrentTime: currentTime})
            console.log(isOverlap); // Muestra si hay superposición o no
        
            return isOverlap;
        });
        return isDuringLunch || isOverlap;
    }


    async getAvailableAppts(yearDayId: number, professionalId: number): Promise<AvailableAppointmentsInterface[]> {
        try {
            const professionalExists = await this.usersService.getUserById(professionalId);
            if (!professionalExists) {
                throw new NotFoundException(`User does not exists with id: ${professionalId}`)
            }
            const yearDayExists = await this.yearDaysService.getYearDay(yearDayId);
            if (!yearDayExists) {
                throw new NotFoundException(`User does not exists with id: ${yearDayId}`)
            }
            const yearDayDate = yearDayExists.day;
            console.log(yearDayDate)
            const dayOfTheWeek = new Date(yearDayDate).getDay() + 1;
           
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
            const { start_time, end_time, appt_interval, appt_duration, break_time_start, break_time_stop, professional_id } = professionalSchedule[0];
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
                const workingHoursObj: AppointmentValuesAndCondition = {
                    start: start_time,
                    end: end_time
                }
                const isBetweenWorkingHours = this.isTimeWithinCertainInterval(currentTime, workingHoursObj);
                // nos aseguramos de que no haya superposición de citas en horarios o que no esté en almuerzo
                const calculateTimeOccupied: CalculateTimeOccupied = {
                    currentTime,
                    endDay: endTime,
                    takenAppts,
                    lunchStart: break_time_start,
                    lunchEnd: break_time_stop
                }
                const isTimeOccupied = this.isTimeOccupied(calculateTimeOccupied);
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
            throw error;
        }


    }

    async getBookedAppts(yearDayId: number, user: User): Promise<Appointment[]> {

        let bookedAppointments: Appointment[] = []
        if (user.user_role_id === 1) {
            bookedAppointments = await this.databaseService.appointment.findMany({
                where: {
                    professional_id: user.id
                },
                include: {
                    client: true,
                    professional: true,
                    yearDay: true
                }
            })
        } else {
            bookedAppointments = await this.databaseService.appointment.findMany({
                where: {
                    client_id: user.id
                },
                include: {
                    client: true,
                    professional: true,
                    yearDay: true
                }
            })
        }
        return bookedAppointments;

    }

    async deleteAppoinment(appointmentId: number, userId: number) {

        try {
            const appointmentToDelete = await this.databaseService.appointment.findUnique({
                where: {
                    id: appointmentId
                }
            })

            if (!appointmentToDelete) {
                throw new NotFoundException(`Appointment not found with id: ${appointmentId}`);
            }


            if (userId !== appointmentToDelete.professional_id && userId !== appointmentToDelete.client_id) {
                throw new ForbiddenException('User does not have the permission to delete the appointment');
            }

            const appointmentDeleted = await this.databaseService.appointment.delete({
                where: {
                    id: appointmentId
                }
            })

            return appointmentDeleted;
        } catch (error) {
            throw error;
        }


    }

}

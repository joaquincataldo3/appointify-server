import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Param } from '@nestjs/common';
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
        const apptStartDate = new Date(apptStart);
        const apptEndDate = new Date(apptEnd);
        // Obtener la diferencia en milisegundos entre las dos fechas
        const milisecondsDifference: number = Math.abs(apptStartDate.getTime() - apptEndDate.getTime());
        // Convertir la diferencia a minutos
        const minutesDifference: number = Math.floor(milisecondsDifference / (1000 * 60));
        return minutesDifference;
    }

    async isAppointmentAvailable(yearDayId: number, professionalId: number, appointmentStartTime: Date, appointmentEndTime: Date): Promise<boolean> {
        try {
            const professionalExists = await this.usersService.getUserById(professionalId);
            if (!professionalExists) {
                throw new NotFoundException(`User does not exist with id: ${professionalId}`);
            }
    
            const yearDayExists = await this.yearDaysService.getYearDay(yearDayId);
            if (!yearDayExists) {
                throw new NotFoundException(`Year day does not exist with id: ${yearDayId}`);
            }
            const yearDayDate = yearDayExists.day;
            const dayOfTheWeek = new Date(yearDayDate).getDay() + 1;
            // Obtener el horario de almuerzo del profesional
            const professionalSchedule = await this.professionalScheduleService.getProfessionalSchedule(professionalId, dayOfTheWeek);
            if (!professionalSchedule) {
                throw new NotFoundException(`Professional schedule not found for professional ${professionalId} and year day ${yearDayId}`);
            }
    
            const { break_time_start, break_time_stop } = professionalSchedule[0];
    
            // Verificar si el horario de la cita está dentro del horario de almuerzo
            const isDuringLunch = this.isTimeWithinCertainInterval(appointmentStartTime, { start: break_time_start, end: break_time_stop }) ||
                                  this.isTimeWithinCertainInterval(appointmentEndTime, { start: break_time_start, end: break_time_stop });
    
            if (isDuringLunch) {
                return false; // El horario de la cita cae dentro del horario de almuerzo
            }
    
            // Verificar si hay una cita en el horario específico
            const takenAppts = await this.databaseService.appointment.findMany({
                where: {
                    professional_id: professionalId,
                    year_day_id: yearDayId
                }
            });
    
            const isAppointmentOccupied = takenAppts.some((appointment) => {
                const apptStart = new Date(appointment.appt_hour_start);
                const apptEnd = new Date(appointment.appt_hour_end);
    
                // Verificar si el horario de la cita coincide exactamente con el horario especificado
                const isExactStart = apptStart.getTime() === appointmentStartTime.getTime();
                const isExactEnd = apptEnd.getTime() === appointmentEndTime.getTime();
                const isOverlap = (appointmentStartTime > apptStart && appointmentStartTime < apptEnd) || 
                                  (appointmentEndTime > apptStart && appointmentEndTime < apptEnd) ||
                                  (appointmentStartTime <= apptStart && appointmentEndTime >= apptEnd);
    
                return isExactStart || isExactEnd || isOverlap;
            });
    
            // Si hay una cita ocupando el horario especificado, retornar false, de lo contrario retornar true
            return !isAppointmentOccupied;
        } catch (error) {
            throw error;
        }
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
            if (!yearDay) {
                throw new NotFoundException('Día del año no encontrado')
            }
            // agarramos el weekday del year day de la cita
            const yearDayExists = await this.yearDaysService.getYearDay(year_day_id);
            if (!yearDayExists) {
                throw new NotFoundException(`User does not exists with id: ${year_day_id}`)
            }
            const yearDayDate = yearDayExists.day;
            const dayOfTheWeek = new Date(yearDayDate).getDay() + 1;
            // agarramos el schedule en el día del profesional
            const professionalSchedule = await this.professionalScheduleService.getProfessionalSchedule(professional_id, dayOfTheWeek);
            if (!professionalSchedule) {
                throw new NotFoundException('Agenda no encontrada')
            }
            const apptHourStartDate = new Date(appt_hour_start);
            const apptHourEndDate = new Date(appt_hour_end);
            const isApptAvailable = await this.isAppointmentAvailable(year_day_id, professional_id, apptHourStartDate, apptHourEndDate);
            if (!isApptAvailable) {
                throw new ConflictException('El horario de la cita no está disponible');
            }

            const newAppointment = await this.databaseService.appointment.create({
                // many to many
                data: {
                    appt_hour_end: apptHourEndDate,
                    appt_hour_start: apptHourStartDate,
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
            throw error;
        }
    }


    isTimeWithinCertainInterval(timeToCheck: string | Date, workingHoursObj: AppointmentValuesAndCondition): boolean {
        const { start, end } = workingHoursObj;
        const newDate = new Date (timeToCheck);
        // convertimos las horas a minutos
        const time = newDate.getHours() * 60 + newDate.getMinutes();

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
            const appointment = await this.getAppointment(appointmentId);
            if (appointment.client_id !== userId && appointment.professional_id !== userId) {
                throw new ForbiddenException("You don't have permission to perform this action")
            }
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

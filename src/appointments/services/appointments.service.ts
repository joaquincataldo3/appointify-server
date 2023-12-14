import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/dto';
import { DatabaseService } from 'src/database/services/database.service';
import { Appointment } from '@prisma/client';
import { ProfessionalScheduleService } from 'src/professional_schedule/service/professional_schedule.service';
import { startOfDay, endOfDay, isWithinInterval, addMinutes } from 'date-fns';
import { AvailableAppointmentsInterface, WorkingHoursInterface } from 'src/professional_schedule/interfaces/interfaces';
import { YearDaysService } from 'src/year_days/services/year_days.service';
import { UsersService } from 'src/users/services/users.service';


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



    isTimeOccupied(start: Date, end: Date, takenAppointments: Appointment[], lunchStart: Date | null, lunchEnd: Date | null) {
        return takenAppointments.some((appointment) => {
            // convertimos los dos a un objeto date para operar
            const apptStart = new Date(appointment.appt_hour_start);
            const apptEnd = new Date(appointment.appt_hour_end);

            // verificamos si hay una superposición de horarios
            const workingHoursObj: WorkingHoursInterface = {
                start: apptStart,
                end: apptEnd
            }
            const isOverlap = isWithinInterval(start, workingHoursObj) ||
                isWithinInterval(end, workingHoursObj);

            // verificamos si la cita está dentro del horario de almuerzo+
            const isDuringLunch = lunchStart !== null && lunchEnd !== null &&
                isWithinInterval(start, { start: lunchStart, end: lunchEnd }) &&
                isWithinInterval(end, { start: lunchStart, end: lunchEnd });

            // Devolver true si hay superposición o está durante el almuerzo
            return isOverlap || isDuringLunch;
        });
    }


    
    async getAvailableAppts(yearDayId: number, professionalId: number): Promise<AvailableAppointmentsInterface[]> {

        try {

            // TODO - COMPARAR DIA DEL AÑO CON EL DIA DE LA SEMANA Y VER SI ESO COINCIDE CON EL HORARIO Y DIA DEL PROFESIONAL

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

            const { start_time, end_time, appt_interval, appt_duration, break_time_start, break_time_stop, professional_id, year_day_id} = professionalSchedule[0];

            const apptDuration = appt_duration; // Duración de la cita en minutos
            const intervalBetweenAppointments = appt_interval;

            // instanciamos las fechas para poder iterar y hacer el while frente a dayend
            const dayStart = startOfDay(new Date());
            const dayEnd = endOfDay(new Date());
            let currentTime = new Date(dayStart);

            while (currentTime < dayEnd) {

                // calculamos el inicio de la cita sin tener en cuenta el intervalo
                let endTime = addMinutes(currentTime, apptDuration);

                // nos aseguramos que las horas esten dentro de las working hours del profesional
                const workingHoursObj: WorkingHoursInterface = {
                    start: start_time,
                    end: end_time
                }
                const isBetweenWorkingHours = isWithinInterval(currentTime, workingHoursObj);

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

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAppointmentDto, GetAvailableApptsDto } from '../dto/dto';
import { DatabaseService } from 'src/database/services/database.service';
import { Appointment } from '@prisma/client';
import { ProfessionalScheduleService } from 'src/professional_schedule/service/professional_schedule.service';
import { startOfDay, endOfDay, isWithinInterval, addMinutes} from 'date-fns';
import { AvailableAppointmentsInterface, WorkingHoursInterface } from 'src/professional_schedule/interfaces/interfaces';

@Injectable()
export class AppointmentsService {

    constructor (private databaseService: DatabaseService, private professionalScheduleService: ProfessionalScheduleService) {}

    async createAppointment(createAppointment: CreateAppointmentDto): Promise<Appointment> {
        try {
            const {user_id, year_day_id, professional_id, ...rest} = createAppointment;
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
            // Convertir el inicio y fin de la cita existente a objetos Date
            const apptStart = new Date(appointment.appt_hour_start);
            const apptEnd = new Date(appointment.appt_hour_end);
    
            // Verificar si hay superposición con la cita existente
            const workingHoursObj: WorkingHoursInterface =  {
                start: apptStart,
                end: apptEnd
            }
            const isOverlap = isWithinInterval(start, workingHoursObj) ||
                isWithinInterval(end, workingHoursObj);
    
            // Verificar si la cita está durante el intervalo de almuerzo
            const isDuringLunch = lunchStart !== null && lunchEnd !== null &&
                isWithinInterval(start, { start: lunchStart, end: lunchEnd }) &&
                isWithinInterval(end, { start: lunchStart, end: lunchEnd });
    
            // Devolver true si hay superposición o está durante el almuerzo
            return isOverlap || isDuringLunch;
        });
    }

    async getAvailableAppts(getAvailableAppts: GetAvailableApptsDto) {
        const {professional_id, year_day_id} = getAvailableAppts;

        const takenAppts = await this.databaseService.appointment.findMany({
            where: {
                professional_id,
                year_day_id
            }
        })

        const professionalSchedule = await this.professionalScheduleService.getProfessionalSchedule(professional_id);

        const availableAppointments: AvailableAppointmentsInterface[] = [];
        
        for(let i = 0; i < professionalSchedule.length; i++) {
            const { start_time, end_time, appt_interval, appt_duration, break_time_start, break_time_stop, professional_id } = professionalSchedule[i];
         
            const intervalBetweenAppointments = appt_interval; 
          
            const dayStart = startOfDay(new Date());
            const dayEnd = endOfDay(new Date());
            let currentTime = new Date(dayStart);
            
            while (currentTime < dayEnd) {
                const apptDurationWithInterval = appt_duration + appt_interval;
                const endTime = addMinutes(currentTime, apptDurationWithInterval);

                const workingHoursObj: WorkingHoursInterface =  {
                    start: start_time,
                    end: end_time
                }
                const isBetweenWorkingHours = isWithinInterval(currentTime, workingHoursObj);
            
                const isTimeOccupied = this.isTimeOccupied(currentTime, endTime, takenAppts, break_time_start, break_time_stop)
              
                // Verificar disponibilidad y agregar la cita
                if (isBetweenWorkingHours && !isTimeOccupied) {
                    const availableApptObj: AvailableAppointmentsInterface = {
                        appt_start_time: currentTime,
                        appt_end_time: endTime,
                        professional_id
                    }
                    availableAppointments.push(availableApptObj);
                  }
              
                currentTime = addMinutes(currentTime, intervalBetweenAppointments);
            }

            return availableAppointments;
        }

    }

}

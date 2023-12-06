import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/dto';
import { DatabaseService } from 'src/database/services/database.service';

@Injectable()
export class AppointmentsService {

    constructor (private databaseService: DatabaseService) {}

    async createAppointment(createAppointment: CreateAppointmentDto) {
        try {
         
            const newAppointment = await this.databaseService.appointment.create({
                // many to many
                data: {
                    hour: { 
                        connect: { id: createAppointment.hour_id } 
                    },
                    client: {
                         connect: { id: createAppointment.user_id } 
                    },
                    yearDay: {
                        connect: { id: createAppointment.year_day_id } 
                    },
                    professional: {
                        connect: { id: createAppointment.professional_id } 
                    }
                }  
            });
        } catch (error) {
           console.log(error);
           throw new InternalServerErrorException(`Error in createAppointment: ${error}`); 
        }
    }

}

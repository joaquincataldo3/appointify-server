import { Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../dto/dto';
import { AppointmentsService } from '../services/appointments.service';

@Controller('appointments')

@ApiTags('Appointments')

export class AppointmentsController {

    constructor (private appointmentsService: AppointmentsService) {}

    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
        return await this.appointmentsService.createAppointment(createAppointmentDto);
    }

}

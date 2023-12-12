import { Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto, GetAvailableApptsDto } from '../dto/dto';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment } from '@prisma/client';

@Controller('appointments')

@ApiTags('Appointments')

export class AppointmentsController {

    constructor (private appointmentsService: AppointmentsService) {}

    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        return await this.appointmentsService.createAppointment(createAppointmentDto);
    }

    async getAvailableAppointments(@Body() getAvailableApptsDto: GetAvailableApptsDto) {
        return await this.appointmentsService.getAvailableAppts(getAvailableApptsDto);
    }

}

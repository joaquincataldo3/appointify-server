import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../dto/dto';
import { GetAvailableApptsParams } from '../interfaces/interfaces';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment } from '@prisma/client';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { RoleAuthorizationGuard } from 'src/auth/guards/authorization/role.authorization.guard';
import { Roles } from 'src/utils/decorators/roles/roles.decorator';
import { Role } from 'src/utils/constants/roles/roles.constant';

@UseGuards(AuthenticationGuard)

@Controller('appointments')

@ApiTags('Appointments')

export class AppointmentsController {

    constructor (private appointmentsService: AppointmentsService) {}

    @Get('available/:yearDayId/:professionalId')
    async getAvailableAppointments(@Param('yearDayId') yearDayId: string, @Param('professionalId') professionalId: string) { 
        const yearIdNumber = Number(yearDayId);
        const professionalIdNumber = Number(professionalId);
        return await this.appointmentsService.getAvailableAppts(yearIdNumber, professionalIdNumber);
    }

    @Post('create')
    @UseGuards(RoleAuthorizationGuard)
    @Roles(Role.Client)
    async createAppointment(@Param() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        return await this.appointmentsService.createAppointment(createAppointmentDto);
    }

}

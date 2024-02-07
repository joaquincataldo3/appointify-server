import { Body, Controller, Delete, ForbiddenException, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../dto/dto';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment, User } from '@prisma/client';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { GetUserDecorator } from 'src/utils/decorators/user/getUser.decorator';
import { AvailableAppointmentsInterface } from 'src/auth/interfaces/interfaces';
import { appointmentIdParam, authorizationTokenSwagger, professionalIdParam, serverErrorReturn, yearIdParam } from 'src/utils/constants/global/global.constants';

@UseGuards(AuthenticationGuard)
@Controller('appointments')
@ApiTags('Appointments')
@ApiHeader(authorizationTokenSwagger)

export class AppointmentsController {

    constructor(private appointmentsService: AppointmentsService) { }

    @ApiParam({name: yearIdParam})
    @ApiParam({name: professionalIdParam})
    @Get(`available/:${yearIdParam}/:${professionalIdParam}`)
    async getAvailableAppointments(@Param(`${yearIdParam}`) yearDayId: string, @Param(`${professionalIdParam}`) professionalId: string): Promise<AvailableAppointmentsInterface[]> {
        try {
            const yearIdNumber = Number(yearDayId);
            const professionalIdNumber = Number(professionalId);
            return await this.appointmentsService.getAvailableAppts(yearIdNumber, professionalIdNumber);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
        } throw new InternalServerErrorException(serverErrorReturn);

    }

    @ApiParam({name: yearIdParam})
    @Get(`booked/:${yearIdParam}`)
    async get(@Param(`${yearIdParam}`) yearDayId: string, @GetUserDecorator() user: User): Promise<Appointment[]> {
        const yearIdNumber = Number(yearDayId);
        return await this.appointmentsService.getBookedAppts(yearIdNumber, user);
    }

    @Post('create')
    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        try {
            return await this.appointmentsService.createAppointment(createAppointmentDto);
        } catch (error) {
            throw new InternalServerErrorException(serverErrorReturn);
        }

    }

    @ApiParam({name: appointmentIdParam})
    @Delete(`delete/:${appointmentIdParam}`)
    async deleteAppointment(@Param(`${appointmentIdParam}`, ParseIntPipe) appointmentId: number, @GetUserDecorator() user: User): Promise<Appointment> {
        try {
            const appointment = await this.appointmentsService.getAppointment(appointmentId);
            const userId = user.id;
            if (appointment.client_id !== userId && appointment.professional_id !== userId) {
                throw new ForbiddenException("You don't have permission to perform this action")
            }
            return await this.appointmentsService.deleteAppoinment(appointmentId, userId);
        } catch (error) {
            const { id } = user;
            await this.appointmentsService.deleteAppoinment(appointmentId, id);
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new InternalServerErrorException(serverErrorReturn);
        }

    }

}

import { Body, Controller, Delete, ForbiddenException, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../dto/dto';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment, User } from '@prisma/client';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { GetUserDecorator } from 'src/utils/decorators/user/getUser.decorator';
import { AvailableAppointmentsInterface } from 'src/auth/interfaces/interfaces';
import { AppointmentSuccessReturn } from '../interfaces/interfaces';


@UseGuards(AuthenticationGuard)
@Controller('appointments')
@ApiTags('Appointments')
@ApiBearerAuth()

export class AppointmentsController {

    constructor(private appointmentsService: AppointmentsService) { }

    @ApiParam({name: 'yearId'})
    @ApiParam({name: 'professionalId'})
    @Get(`available/:yearId/:professionalId`)
    async getAvailableAppointments(@Param(`${'yearId'}`) yearDayId: string, @Param('professionalId') professionalId: string): Promise<AvailableAppointmentsInterface[]> {
        try {
            const yearIdNumber = Number(yearDayId);
            const professionalIdNumber = Number(professionalId);
            return await this.appointmentsService.getAvailableAppts(yearIdNumber, professionalIdNumber);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
        } throw new InternalServerErrorException('Unexpected server error');

    }

    @ApiParam({name: 'yearId'})
    @Get('booked/:yearId')
    async get(@Param('yearId') yearDayId: string, @GetUserDecorator() user: User): Promise<Appointment[]> {
        const yearIdNumber = Number(yearDayId);
        return await this.appointmentsService.getBookedAppts(yearIdNumber, user);
    }

    @Post('create')
    async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto): Promise<AppointmentSuccessReturn> {
        try {
            return await this.appointmentsService.createAppointment(createAppointmentDto);
        } catch (error) {
            throw new InternalServerErrorException('Unexpected server error');
        }

    }

    @ApiParam({name: 'appointmentId'})
    @Delete('delete/:appointmentId')
    async deleteAppointment(@Param('appointmentId', ParseIntPipe) appointmentId: number, @GetUserDecorator() user: User): Promise<Appointment> {
        try {
            const userId = user.id;
            return await this.appointmentsService.deleteAppoinment(appointmentId, userId);
        } catch (error) {
            throw new InternalServerErrorException('Unexpected server error');
        }

    }

}

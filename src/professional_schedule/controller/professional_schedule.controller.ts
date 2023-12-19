import { Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfessionalScheduleService } from '../service/professional_schedule.service';
import { ProfessionalScheduleInBody } from '../dto/dto';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { professionalIdParam, scheduleIdParam, serverErrorReturn } from 'src/utils/constants/global/global.constants';
import { CustomValuesConflict } from 'src/utils/custom-exceptions/custom.exceptions';
import { IsSameProfessionalGuard } from 'src/auth/guards/authorization/isSameProfessional.guard';

@UseGuards(AuthenticationGuard)

@Controller('professional-schedule')

@ApiTags('ProfessionalSchedule')

export class ProfessionalScheduleController {

    constructor(private ProfessionalScheduleService: ProfessionalScheduleService) {}

    @Get(`:${professionalIdParam}`)
    async getProfessionalSchedule (@Param(professionalIdParam, ParseIntPipe) professionalId: number) {
        return await this.ProfessionalScheduleService.getProfessionalSchedule(professionalId);
    }

    @Post('create') 
    @UseGuards(IsSameProfessionalGuard)
    @HttpCode(201)
    async createProfessionalWorkDay (@Body() createScheduleBody: ProfessionalScheduleInBody) {
        try {
            return await this.ProfessionalScheduleService.createSchedule(createScheduleBody);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else if (error instanceof CustomValuesConflict) {
                throw error;
            }
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }

    @Put(`update/${scheduleIdParam}`)
    @UseGuards(IsSameProfessionalGuard)
    async updateSchedule(){
        try {
            
        } catch (error) {
            
        }
    }

    @Delete(`delete/:${scheduleIdParam}`)
    @UseGuards(IsSameProfessionalGuard)
    async deleteProfessionalSchedule(@Param(scheduleIdParam, ParseIntPipe) scheduleId: number) {
        try {
            return await this.ProfessionalScheduleService.deleteSchedule(scheduleId);
        } catch (error) {
            if(error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }
}

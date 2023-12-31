import { Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProfessionalScheduleService } from '../service/professional_schedule.service';
import { ProfessionalScheduleInBody } from '../dto/dto';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { PrismaNotFoundCode, professionalIdParam, scheduleIdParam, serverErrorReturn } from 'src/utils/constants/global/global.constants';
import { CustomValuesConflict, RecordNotFoundException } from 'src/utils/custom-exceptions/custom.exceptions';
import { IsSameProfessionalGuard } from 'src/auth/guards/authorization/isSameProfessional.guard';
import { Prisma } from '@prisma/client';
import { BatchPayload } from 'src/utils/global-interfaces/global.interfaces';

@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
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

    @Put(`update/:${professionalIdParam}`)
    @UseGuards(IsSameProfessionalGuard)
    async updateSchedule(@Param(professionalIdParam, ParseIntPipe) professionalId: number, newSchedule: ProfessionalScheduleInBody): Promise<BatchPayload>{
        try {
            return await this.ProfessionalScheduleService.updateSchedule(professionalId, newSchedule);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaNotFoundCode) {
                throw new RecordNotFoundException();
            } 
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }

    @Delete(`delete/:${professionalIdParam}/:${scheduleIdParam}`)
    @UseGuards(IsSameProfessionalGuard)
    async deleteProfessionalSchedule(@Param(scheduleIdParam, ParseIntPipe) scheduleId: number) {
        try {
            return await this.ProfessionalScheduleService.deleteSchedule(scheduleId);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaNotFoundCode) {
                throw new RecordNotFoundException();
            } 
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }
}

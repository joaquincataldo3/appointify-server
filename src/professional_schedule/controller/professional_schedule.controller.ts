import { Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProfessionalScheduleService } from '../service/professional_schedule.service';
import { ProfessionalScheduleInBody } from '../dto/dto';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { PrismaNotFoundCode, professionalIdParam, scheduleIdParam, serverErrorReturn } from 'src/utils/constants/global/global.constants';
import { CustomValuesConflict, RecordNotFoundException } from 'src/utils/custom-exceptions/custom.exceptions';
import { IsSameProfessionalGuard } from 'src/auth/guards/authorization/isSameProfessional.guard';
import { Prisma, User } from '@prisma/client';
import { BatchPayload } from 'src/utils/global-interfaces/global.interfaces';
import { GetUserDecorator } from 'src/utils/decorators/user/getUser.decorator';
import { UpdateScheduleReturn } from '../interfaces/interfaces';

@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
@Controller('professional-schedule')
@ApiTags('ProfessionalSchedule')

export class ProfessionalScheduleController {

    constructor(private ProfessionalScheduleService: ProfessionalScheduleService) {}

    @Get(':professionalId')
    @ApiParam({name: 'professionalId'})
    async getProfessionalSchedule (@Param('professionalId', ParseIntPipe) professionalId: number) {
        return await this.ProfessionalScheduleService.getProfessionalSchedule(professionalId);
    }

    @Post('create/:professionalId') 
    @ApiParam({name: 'professionalId'})
    @UseGuards(IsSameProfessionalGuard)
    @HttpCode(201)
    async createProfessionalWorkDay (@Body() createScheduleBody: ProfessionalScheduleInBody, @Param('professionalId', ParseIntPipe) professionalId: number) {
        try {
            return await this.ProfessionalScheduleService.createSchedule(createScheduleBody, professionalId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else if (error instanceof CustomValuesConflict) {
                throw error;
            }
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }

    @Put('update/:professionalId')
    @ApiParam({name: 'professionalId'})
    @UseGuards(IsSameProfessionalGuard)
    async updateSchedule(@Param('professionalId', ParseIntPipe) professionalId: number, @Body() newSchedule: ProfessionalScheduleInBody): Promise<UpdateScheduleReturn>{
        try {
            return await this.ProfessionalScheduleService.updateSchedule(professionalId, newSchedule);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaNotFoundCode) {
                throw new RecordNotFoundException();
            } 
            throw new InternalServerErrorException(serverErrorReturn);
        }
    }
    
    @Delete('delete/:scheduleId')
    @ApiParam({name: 'scheduleId'})
    @UseGuards(IsSameProfessionalGuard)
    async deleteProfessionalSchedule(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
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

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfessionalIdParam } from '../interfaces/interfaces';
import { ProfessionalScheduleService } from '../service/professional_schedule.service';
import { ProfessionalScheduleBody } from '../dto/dto';

@Controller('professional-work-day')

@ApiTags('ProfessionalSchedule')

export class ProfessionalScheduleController {

    constructor(private ProfessionalScheduleService: ProfessionalScheduleService) {}

    @Get(':professionalId')
    async getProfessionalSchedule (@Param() params: ProfessionalIdParam) {
        const professionalId = params.professionalId;
        return await this.ProfessionalScheduleService.getProfessionalSchedule(professionalId);
    }

    @Post('/create') 
    async createProfessionalWorkDay (@Body() createScheduleBody: ProfessionalScheduleBody[]) {
        return await this.createProfessionalWorkDay(createScheduleBody);
    }

}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfessionalIdParam } from '../interfaces/interfaces';
import { ProfessionalScheduleService } from '../service/professional_schedule.service';
import { ProfessionalScheduleBody } from '../dto/dto';
import { AuthenticationGuard } from 'src/auth/guards/authentication/authentication.guard';
import { RoleAuthorizationGuard } from 'src/auth/guards/authorization/role.authorization.guard';
import { Roles } from 'src/utils/decorators/roles/roles.decorator';
import { Role } from 'src/utils/constants/roles/roles.constant';

@UseGuards(AuthenticationGuard)

@Controller('professional-schedule')

@ApiTags('ProfessionalSchedule')

export class ProfessionalScheduleController {

    constructor(private ProfessionalScheduleService: ProfessionalScheduleService) {}

    @Get(':professionalId')
    async getProfessionalSchedule (@Param() params: ProfessionalIdParam) {
        const professionalId = params.professionalId;
        return await this.ProfessionalScheduleService.getProfessionalSchedule(professionalId);
    }

    @Post('/create') 
    @UseGuards(RoleAuthorizationGuard)
    @Roles(Role.Professional)
    async createProfessionalWorkDay (@Body() createScheduleBody: ProfessionalScheduleBody[]) {
        console.log('controller', createScheduleBody);
        return await this.ProfessionalScheduleService.createSchedule(createScheduleBody);
    }

}

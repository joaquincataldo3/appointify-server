import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database.service';
import { CreateProfessionalHours } from '../dto/dto';
// import { ProfessionalHour } from '@prisma/client';

@Injectable()
export class ProfessionalHoursService {

    constructor (private databaseService: DatabaseService) {}

    async createProfessionalHours(createProfessionalHoursObj: CreateProfessionalHours[]): Promise<boolean> {
        try {
            return true;
        } catch (error) {
            throw new InternalServerErrorException('Error in createProfessionalHours');
        }
    }

}

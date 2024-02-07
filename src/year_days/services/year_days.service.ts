import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { YearDay } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database.service';

@Injectable()
export class YearDaysService {

    constructor(private databaseService: DatabaseService) {}

    async getYearDay(yearDayId: number): Promise<YearDay | false> {
        try {
            const yearDay = await this.databaseService.yearDay.findUnique({
                where: {
                    id: yearDayId
                }
            })
            if (!yearDay) {
                return false
            }
            return yearDay;
        } catch (error) {
            throw new InternalServerErrorException(`Error in getYearDay ${error}`)
        }
    }

}

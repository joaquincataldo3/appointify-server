import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsNotEmpty, IsNumber } from "class-validator"


export class ProfessionalScheduleBody { 
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    professional_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    week_day_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    start_time: Date

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    end_time: Date

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    break_time_start: Date

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    break_time_stop: Date

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    interval_time: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    appointment_duration: number

}


export interface Schedule {
    id: number
    professional_id: number
    day_of_the_week_id: number
    start_time: Date
    end_time: Date
    break_time_start: Date
    break_time_stop: Date
}

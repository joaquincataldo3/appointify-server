import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsNotEmpty, IsNumber, Min } from "class-validator"

export class ProfessionalSchedule { 
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
    appt_interval: number
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(5)
    appt_duration: number

}

export class ProfessionalScheduleInBody {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    professional_id: number

    @IsNotEmpty()
    schedule: ProfessionalSchedule[]

}


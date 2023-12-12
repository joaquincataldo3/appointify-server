import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class CreateAppointmentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    professional_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    year_day_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    hour_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    appt_hour_start: Date

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    appt_hour_end: Date

}

export class GetAvailableApptsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    professional_id: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    year_day_id: number

}
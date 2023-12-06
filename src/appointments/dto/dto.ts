import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

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

}
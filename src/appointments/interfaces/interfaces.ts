import { User, YearDay } from "@prisma/client"

export interface GetAvailableApptsParams {
    year_day_id: string
    professional_id: string
}

export interface SetHoursAndMinutes {
    hours: number
    minutes : number
}

export interface IAppointment {
    appt_hour_start: Date
    appt_hour_end: Date
    client: User
    professional: User
    year_day: YearDay
}
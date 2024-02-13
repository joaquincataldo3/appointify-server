import { Appointment } from "@prisma/client"

export interface GetAvailableApptsParams {
    year_day_id: string
    professional_id: string
}

export interface SetHoursAndMinutes {
    hours: number
    minutes : number
}

export interface AppointmentSuccessReturn {
    appointment: Appointment
    emailResult: boolean
}

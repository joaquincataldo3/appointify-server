import { Appointment, User } from "@prisma/client"

export interface SignTokenInterface {
    id: number
    username: string
    email: string,
    user_role_id: number
}

export interface UserSignInReturn {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    token: string
    user_role_id: number 
}

export interface RequestUser {
    id: number,
    email: string
    username: string
    token: string
    exp: number
    iat: number
}

export interface AvailableAppointmentsInterface {
    appt_start_time: Date
    appt_end_time: Date
    professional_id: number
}

export interface AppointmentValuesAndCondition {
    start: Date,
    end: Date
}
 
export interface CalculateTimeOccupied  {
    currentTime: Date,
    endDay: Date,
    takenAppts: Appointment[],
    lunchStart: Date | null
    lunchEnd: Date | null
}
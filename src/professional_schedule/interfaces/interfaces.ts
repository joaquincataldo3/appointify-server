export interface ProfessionalIdParam {
    professionalId: number
}

export interface AvailableAppointmentsInterface {
    appt_start_time: Date
    appt_end_time: Date
    professional_id: number
}

export interface WorkingHoursInterface {
    start: Date,
    end: Date
}
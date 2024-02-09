export interface DaySchedule {
    id: number
    professional_id: number
    day_of_the_week_id: number
    start_time: Date
    end_time: Date
    break_time_start: Date
    break_time_stop: Date
}

export interface Schedule {
    professional_id: number
    schedule: DaySchedule[]
}

export interface UpdateScheduleReturn {
    affectedRows: number
    length: number
}



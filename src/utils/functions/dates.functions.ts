import { GetSplittedDateReturn } from "../global-interfaces/global.interfaces";

export const getSplittedDate = (date: Date): GetSplittedDateReturn => {
    const newDate = new Date(date);
    const hour = newDate.getUTCHours();
    const minutes = newDate.getMinutes();
    let dateSplittedReturn: GetSplittedDateReturn = {
        hour,
        minutes
    }
    return dateSplittedReturn;
}
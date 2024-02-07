import { GetSplittedDateReturn } from "../global-interfaces/global.interfaces";

export const getSplittedDate = (date: Date): GetSplittedDateReturn => {
    let dateSplittedReturn: GetSplittedDateReturn;
    dateSplittedReturn.hour = date.getHours();
    dateSplittedReturn.minutes = date.getMinutes();
    return dateSplittedReturn;
}
import { RequestSuccessNoEntity } from "src/utils/global-interfaces/global.interfaces";

export interface WelcomeMessage extends RequestSuccessNoEntity {
    welcome: string
    description: string
}
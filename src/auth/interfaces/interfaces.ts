import { User } from "@prisma/client"

export interface SignTokenInterface {
    id: number
    username: string
    email: string,
}

export interface UserSignInReturn {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    token: string
    user_role_id: number | any
}

export interface RequestUser {
    id: number,
    email: string
    username: string
    token: string
    exp: number
    iat: number
}
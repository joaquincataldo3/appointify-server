import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {

    allUsers() {
        return "All users !"
    }

}

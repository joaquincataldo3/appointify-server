import { Controller, Get } from '@nestjs/common';
import { WelcomeMessage } from '../interfaces/interfaces';
import { WelcomeService } from '../services/welcome.service';

@Controller('')
export class WelcomeController {

    constructor(private welcomeService: WelcomeService) {}

    @Get('')
    getWelcomeMessage(): WelcomeMessage {
        return this.welcomeService.getWelcomeMessage()
    }

}

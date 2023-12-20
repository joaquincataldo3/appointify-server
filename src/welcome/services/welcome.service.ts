import { Injectable } from '@nestjs/common';
import { WelcomeMessage } from '../interfaces/interfaces';

@Injectable()
export class WelcomeService {

    getWelcomeMessage(): WelcomeMessage {
        return {
            welcome: 'Welcome to Appointify API',
            description: 'Go to /docs for more information',
            ok: true
        }
    }

}

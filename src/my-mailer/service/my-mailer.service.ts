import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Appointment, User } from '@prisma/client';
import { IAppointment } from 'src/appointments/interfaces/interfaces';

@Injectable()
export class MyMailerService {

    constructor(
        private mailerService: MailerService,
        private configService: ConfigService
    ) { }

    private appointmentCreateSubject: string = 'Turno creado';

    async sendMail(toEmail: string, htmlTemplate: string) {
        const result = await this.mailerService.sendMail({
            from: this.configService.get<string>('MAILER_EMAIL'),
            to: toEmail,
            subject: this.appointmentCreateSubject,
            html: htmlTemplate
        })
        return { ok: result.response === 'OK' ? true : false }
    }

    async sendAppointmentCreatedEmail(user: User, professional: User, appointment: IAppointment, sendTo: string) {
        const htmlTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Appointment Created</title>
            </head>
            <body>
                <div>
                    <h2>${sendTo === 'user' ? 'Turno creado exitosamente' : 'Se ha registrado un turno'}</h2>
                    <p>Hola ${sendTo === 'user' ? `${user.first_name}` : `${professional.first_name}`},</p>
                    <p>${sendTo === 'user' ? `Tu turno con ${professional.first_name} ${professional.last_name} ha sido creado exitosamente.` : `Se ha registrado una cita. Nombre: ${user.first_name}. Apellido: ${user.last_name}`}</p>
                    <p>Horario ${appointment.appt_hour_start} a ${appointment.appt_hour_end}. </p>
                    <p>Atentamente,</p>
                    <p>Appointify</p>
                </div>
            </body>
            </html>
        `;
        const email = sendTo === 'user' ? user.email : professional.email;
        const result = await this.sendMail(email, htmlTemplate);
        return result;
    }

    async sendAppointmentCanceledEmail(user: User, professional: User, appointment: IAppointment, sendTo: string) {
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Created</title>
        </head>
        <body>
            <div>
                <h2>Turno Cancelado</h2>
                <p>Hola ${sendTo === 'user' ? user.first_name : professional.first_name},</p>
                <p>${sendTo === 'user' ? `Tu cita con ${professional.first_name} ${professional.last_name} ha sido cancelada exitosamente` : `Se ha cancelado una cita prevista. Nombre: ${user.first_name}. Appelido: ${user.last_name}`} </p>
                <p>Horario ${appointment.appt_hour_start} a ${appointment.appt_hour_end}. </p>
                <p>Atentamente,</p>
                <p>Appointify</p>
            </div>
        </body>
        </html>
    `;
        const email = sendTo === 'user' ? user.email : professional.email;
        const result = await this.sendMail(email, htmlTemplate);
        return result;
    }

}

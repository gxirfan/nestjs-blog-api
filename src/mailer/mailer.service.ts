import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendMail(options: { to: string, subject: string, html: string }) {
    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
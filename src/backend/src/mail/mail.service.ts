import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome!',
      text: `Welcome, ${name}!`,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Atur Ulang Kata Sandi Anda',
      text: `Halo ${name},\n\nSilakan klik tautan berikut untuk mengatur ulang kata sandi Anda:\n${resetUrl}\n\nJika Anda tidak meminta perubahan ini, abaikan email ini.`,
      html: `
        <p>Halo ${name},</p>
        <p>Silakan klik tautan berikut untuk mengatur ulang kata sandi Anda:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Jika Anda tidak meminta perubahan ini, abaikan email ini.</p>
      `,
    });
  }
}

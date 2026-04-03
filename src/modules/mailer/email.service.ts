import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { emailTemplates } from './email-templates/email-templates';
import { CoreConfig } from '../../core/core.config';

const MAILER_USER = 'yusovsky2@gmail.com';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly coreConfig: CoreConfig) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MAILER_USER,
        pass: 'nrsikbvoaunqxqud', //'fedhcehyopbmnpxt',
      },
    });
  }

  async sendConfirmationEmail(
    email: string,
    code: string,
    lang: string,
  ): Promise<void> {
    await this.sendEmail(email, code, lang, emailTemplates.registrationEmail);
  }

  async sendRecoveryEmail(
    email: string,
    code: string,
    lang: string,
  ): Promise<void> {
    await this.sendEmail(email, code, lang, emailTemplates.passwordRecoveryEmail);
  }

  private async sendEmail(
    email: string,
    code: string,
    lang: string,
    template: (code: string, lang: string) => string,
  ): Promise<boolean> {
    const html = template(code, lang);

    if (this.coreConfig.isUserAutomaticallyConfirmed) {
      this.logger.log(`[BYPASS] Email content for ${email}: \n${html}`);
      return true;
    }

    const info = await this.transporter.sendMail({
      from: `"Yoga Club" <${MAILER_USER}>`,
      to: email,
      subject: 'Your code is here',
      html: html,
    });

    this.logger.log(`Email sent to ${email}, messageId: ${info.messageId}`);
    return !!info;
  }
}

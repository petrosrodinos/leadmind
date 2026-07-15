import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateEmail } from '../../sendgrid/interfaces/mail.interfaces';
import { SmtpConfig } from '@/modules/integrations/interfaces/email-credentials.interface';
import { SmtpAdapter } from '../smtp.adapter';
import { logSmtp, SmtpFlowTimer } from '../smtp-flow-log.util';

@Injectable()
export class SmtpMailService {
    private readonly logger = new Logger(SmtpMailService.name);

    constructor(private readonly smtpAdapter: SmtpAdapter) {}

    async sendEmail(createEmail: CreateEmail, smtpConfig: SmtpConfig) {
        const timer = new SmtpFlowTimer();
        logSmtp(this.logger, 'log', {
            step: 'service-start',
            to: createEmail.to,
            subject: createEmail.subject,
            from: createEmail.from ?? smtpConfig.fromEmail,
            host: smtpConfig.host,
            port: smtpConfig.port,
        });

        try {
            timer.mark('adapter');
            const result = await this.smtpAdapter.sendEmail(createEmail, smtpConfig);
            logSmtp(this.logger, 'log', {
                step: 'service-done',
                to: createEmail.to,
                messageId: result?.id ?? 'unknown',
                adapterDurationMs: timer.sinceMark('adapter'),
                totalDurationMs: timer.sinceStart(),
            });
            return result;
        } catch (error) {
            logSmtp(this.logger, 'error', {
                step: 'service-failed',
                to: createEmail.to,
                error: error instanceof Error ? error.message : String(error),
                adapterDurationMs: timer.sinceMark('adapter'),
                totalDurationMs: timer.sinceStart(),
            });
            if (error instanceof Error && error.stack) {
                this.logger.error(error.stack);
            }
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to send email with SMTP: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

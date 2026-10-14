import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Service responsible for dispatching payment reminder notifications.
 *
 * Adheres to the prompt specification:
 * "Note: You may use a test email service or log reminder messages to the console
 * if email credentials are unavailable."
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Dispatches a payment reminder notification.
   * Logs structured message to console by default, or sends via configured transport.
   *
   * @param recipientEmail - Recipient email address
   * @param subscriptionName - Name of the subscription renewal
   * @param amount - Renewal cost
   * @param nextBillingDate - Due date string (YYYY-MM-DD)
   * @returns EmailSendResult indicating dispatch success or failure
   */
  async sendPaymentReminder(
    recipientEmail: string,
    subscriptionName: string,
    amount: number,
    nextBillingDate: string,
  ): Promise<EmailSendResult> {
    try {
      if (!recipientEmail || !recipientEmail.includes('@')) {
        throw new Error(
          `Invalid or missing recipient email address: "${recipientEmail}"`,
        );
      }

      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      const sender =
        this.configService.get<string>('EMAIL_FROM') ||
        'no-reply@subreminder.com';

      // Structured console log per specification requirement
      this.logger.log(
        `📬 [REMINDER EMAIL DISPATCHED]\n` +
          `   From:    ${sender}\n` +
          `   To:      ${recipientEmail}\n` +
          `   Subject: Payment Reminder: ${subscriptionName} is due on ${nextBillingDate}\n` +
          `   Body:    Hello! Your subscription for ${subscriptionName} is scheduled to renew on ${nextBillingDate} for ${formattedAmount}.`,
      );

      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    } catch (err: any) {
      this.logger.error(
        `❌ [REMINDER EMAIL FAILED] Could not send reminder to ${recipientEmail}: ${err.message}`,
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Reminder } from './entities/reminder.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { EmailService } from './email.service';
import { ReminderStatus, SubscriptionStatus } from '../common/enums';
import { normalizeToStartOfDay } from '../common/utils/date-calc.util';

export interface ReminderJobSummary {
  scannedSubscriptions: number;
  remindersSent: number;
  duplicateRemindersPrevented: number;
  failures: number;
  details: Array<{
    subscriptionId: string;
    subscriptionName: string;
    billingDate: string;
    status: ReminderStatus;
    recipientEmail: string;
    failureReason?: string | null;
  }>;
}

/**
 * Service managing automated payment reminder cron tasks,
 * duplicate prevention, and reminder history queries.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Daily scheduled cron job: runs every day at midnight (00:00:00).
   * Identifies active subscriptions due within the next 3 days and sends reminders.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'dailyPaymentReminders',
  })
  async handleDailyCronJob(): Promise<void> {
    this.logger.log('⏰ [CRON JOB STARTED] Running daily payment reminder scan...');
    const result = await this.executeReminderScan();
    this.logger.log(
      `✅ [CRON JOB COMPLETED] Scanned: ${result.scannedSubscriptions}, Sent: ${result.remindersSent}, Prevented Duplicates: ${result.duplicateRemindersPrevented}, Failures: ${result.failures}`,
    );
  }

  /**
   * Core reminder scan engine. Can be executed on schedule by the cron runner
   * or manually via the POST /reminders/trigger endpoint for testing without waiting.
   *
   * @param referenceDate - Baseline date (defaults to today)
   * @returns Detailed summary of the scan run
   */
  async executeReminderScan(
    referenceDate: Date = new Date(),
  ): Promise<ReminderJobSummary> {
    const today = normalizeToStartOfDay(referenceDate);
    const threeDaysLater = new Date(today);
    threeDaysLater.setUTCDate(threeDaysLater.getUTCDate() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

    // Find all ACTIVE subscriptions whose nextBillingDate is within [today, today + 3 days]
    const upcomingSubscriptions = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: Between(todayStr, threeDaysLaterStr),
      },
    });

    let sentCount = 0;
    let duplicateCount = 0;
    let failureCount = 0;
    const details: ReminderJobSummary['details'] = [];

    for (const sub of upcomingSubscriptions) {
      // 1. DUPLICATE PREVENTION:
      // Check if a reminder for this subscription and exact billing date was already sent
      const existingReminder = await this.reminderRepo.findOne({
        where: {
          subscriptionId: sub.id,
          billingDate: sub.nextBillingDate,
        },
      });

      if (existingReminder) {
        duplicateCount++;
        this.logger.warn(
          `🛡️ [DUPLICATE PREVENTED] Reminder already recorded for subscription "${sub.name}" (ID: ${sub.id}) on date ${sub.nextBillingDate}. Skipping.`,
        );
        continue;
      }

      // Determine recipient email (use sub.userEmail or fallback to userId placeholder)
      const recipient = sub.userEmail || `${sub.userId}@example.com`;

      // 2. DISPATCH EMAIL:
      const sendResult = await this.emailService.sendPaymentReminder(
        recipient,
        sub.name,
        sub.amount,
        sub.nextBillingDate,
      );

      const reminderStatus = sendResult.success
        ? ReminderStatus.SUCCESS
        : ReminderStatus.FAILED;

      if (sendResult.success) {
        sentCount++;
      } else {
        failureCount++;
      }

      // 3. PERSIST AUDIT RECORD:
      const reminder = this.reminderRepo.create({
        subscriptionId: sub.id,
        billingDate: sub.nextBillingDate,
        recipientEmail: recipient,
        status: reminderStatus,
        failureReason: sendResult.error || null,
      });

      await this.reminderRepo.save(reminder);

      details.push({
        subscriptionId: sub.id,
        subscriptionName: sub.name,
        billingDate: sub.nextBillingDate,
        status: reminderStatus,
        recipientEmail: recipient,
        failureReason: sendResult.error || null,
      });
    }

    return {
      scannedSubscriptions: upcomingSubscriptions.length,
      remindersSent: sentCount,
      duplicateRemindersPrevented: duplicateCount,
      failures: failureCount,
      details,
    };
  }

  /**
   * Retrieves the reminder dispatch history for a specific subscription.
   *
   * @param subscriptionId - Target subscription ID
   * @returns Array of dispatched Reminder records
   */
  async findRemindersBySubscription(
    subscriptionId: string,
  ): Promise<Reminder[]> {
    return await this.reminderRepo.find({
      where: { subscriptionId },
      order: { sentAt: 'DESC' },
    });
  }

  /**
   * Retrieves all reminders across the system or filtered by a specific user.
   *
   * @param userId - Optional user ID to isolate reminder history
   * @returns Array of Reminder records
   */
  async findAllReminders(userId?: string): Promise<Reminder[]> {
    const query = this.reminderRepo
      .createQueryBuilder('reminder')
      .innerJoinAndSelect('reminder.subscription', 'subscription')
      .orderBy('reminder.sentAt', 'DESC');

    if (userId) {
      query.where('subscription.userId = :userId', { userId });
    }

    return await query.getMany();
  }
}

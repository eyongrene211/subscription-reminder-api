import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ReminderStatus } from '../../common/enums';
import type { Subscription } from '../../subscriptions/entities/subscription.entity';

/**
 * Reminder Entity storing the audit trail of dispatched payment reminders.
 *
 * Enforces duplicate prevention at the database level using a composite
 * unique index over (subscriptionId, billingDate).
 */
@Entity('reminders')
@Index(['subscriptionId', 'billingDate'], { unique: true })
export class Reminder {
  /** Unique reminder ID (UUID v4) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key pointing to the target subscription */
  @Column({ type: 'uuid' })
  subscriptionId: string;

  /** Associated subscription record */
  @ManyToOne('Subscription', 'reminders', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  /** Target billing date for which this reminder was generated (YYYY-MM-DD) */
  @Column({ type: 'date' })
  billingDate: string;

  /** Status of reminder dispatch: SUCCESS or FAILED */
  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.SUCCESS,
  })
  status: ReminderStatus;

  /** Recipient email address that received the notification */
  @Column({ type: 'varchar', length: 255 })
  recipientEmail: string;

  /** Error details if email delivery encountered a failure */
  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  /** Timestamp when the notification was dispatched */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  sentAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BillingCycle, SubscriptionStatus } from '../../common/enums';
import type { Reminder } from '../../reminders/entities/reminder.entity';

/**
 * Subscription Entity representing a recurring user subscription.
 *
 * Stores all subscription metadata, pricing, recurring intervals,
 * and maintains relation to reminder dispatches.
 */
@Entity('subscriptions')
export class Subscription {
  /** Unique identifier (UUID v4) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Name of the subscription (e.g. 'Netflix', 'Spotify', 'AWS') */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Subscription recurring cost amount */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /** Anchor / original billing start date (YYYY-MM-DD) */
  @Column({ type: 'date' })
  billingDate: string;

  /** Calculated next upcoming billing date (YYYY-MM-DD) */
  @Index()
  @Column({ type: 'date' })
  nextBillingDate: string;

  /** Billing recurrence frequency: MONTHLY or YEARLY */
  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  /** Subscription active status */
  @Index()
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  /** Identifier of the user who owns this subscription (data isolation) */
  @Index()
  @Column({ type: 'varchar', length: 255 })
  userId: string;

  /** Notification email address for sending reminders */
  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string | null;

  /** Automated payment reminders sent for this subscription */
  @OneToMany('Reminder', 'subscription', {
    cascade: true,
  })
  reminders: Reminder[];

  /** Record creation timestamp */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  /** Record last update timestamp */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

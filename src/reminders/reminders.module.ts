import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { EmailService } from './email.service';
import { Reminder } from './entities/reminder.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

/**
 * Reminders Module encapsulating automated cron processing, email dispatches,
 * and reminder history endpoints.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, Subscription]),
    SubscriptionsModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService, EmailService],
  exports: [RemindersService],
})
export class RemindersModule {}

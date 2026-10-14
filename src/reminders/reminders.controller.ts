import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { RemindersService, ReminderJobSummary } from './reminders.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Reminder } from './entities/reminder.entity';

/**
 * Controller providing endpoints for reminder history and manual cron trigger.
 */
@ApiTags('Reminders')
@ApiHeader({
  name: 'x-user-id',
  description: 'Unique user identifier for data isolation (defaults to default-user-1)',
  required: false,
})
@Controller()
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('subscriptions/:id/reminders')
  @ApiOperation({
    summary: 'View reminder history for a specific subscription',
    description:
      'Returns all reminder dispatch records for the given subscription ID (verifying ownership).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reminder records for the subscription.',
    type: [Reminder],
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found or not owned by user.',
  })
  async getSubscriptionReminders(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<Reminder[]> {
    // Verify that the subscription exists and belongs to the requesting user
    await this.subscriptionsService.findOneForUser(id, userId);
    return this.remindersService.findRemindersBySubscription(id);
  }

  @Get('reminders')
  @ApiOperation({
    summary: 'View all reminder dispatch history',
    description:
      'Returns all reminder dispatch records, scoped to the current user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all reminder history records.',
    type: [Reminder],
  })
  async getAllReminders(@CurrentUser() userId: string): Promise<Reminder[]> {
    return this.remindersService.findAllReminders(userId);
  }

  @Post('reminders/trigger')
  @ApiOperation({
    summary: 'Manually trigger the payment reminder scan (Test without waiting for midnight)',
    description:
      'Immediately runs the payment reminder job, scans for upcoming subscriptions due within 3 days, dispatches emails, and prevents duplicates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary of the executed reminder scan.',
  })
  async triggerReminderScan(): Promise<ReminderJobSummary> {
    return this.remindersService.executeReminderScan();
  }
}

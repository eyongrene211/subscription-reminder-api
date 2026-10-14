import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle, SubscriptionStatus } from '../../common/enums';

/**
 * Data Transfer Object for creating a new subscription.
 */
export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Name of the service or product subscription',
    example: 'Netflix Premium',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @ApiProperty({
    description: 'Recurring billing amount (must be positive)',
    example: 15.99,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;

  @ApiProperty({
    description: 'Starting billing date in ISO format (YYYY-MM-DD)',
    example: '2026-10-15',
  })
  @IsDateString(
    {},
    { message: 'Billing date must be a valid ISO date string (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'Billing date is required' })
  billingDate: string;

  @ApiProperty({
    description: 'Billing recurrence frequency',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle, {
    message: 'Invalid billing cycle. Must be MONTHLY or YEARLY',
  })
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Initial subscription status',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus, {
    message: 'Invalid status. Must be ACTIVE or CANCELLED',
  })
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Notification email for payment reminders',
    example: 'subscriber@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'User email must be a valid email address' })
  userEmail?: string;
}

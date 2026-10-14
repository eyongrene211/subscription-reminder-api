import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../common/enums';

/**
 * Query parameters for filtering subscriptions.
 */
export class FilterSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Filter subscriptions by active or cancelled status',
    enum: SubscriptionStatus,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus, {
    message: 'Status filter must be either ACTIVE or CANCELLED',
  })
  status?: SubscriptionStatus;
}

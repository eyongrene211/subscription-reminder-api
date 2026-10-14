import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';

/**
 * Data Transfer Object for updating an existing subscription.
 * All fields are optional.
 */
export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}

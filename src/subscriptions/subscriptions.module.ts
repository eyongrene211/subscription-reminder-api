import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';

/**
 * Subscriptions Module encapsulating subscription entities, services, and HTTP routes.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService, TypeOrmModule],
})
export class SubscriptionsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RemindersModule } from './reminders/reminders.module';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { Reminder } from './reminders/entities/reminder.entity';

/**
 * Root Application Module configuring database connectivity,
 * scheduling engine, and domain feature modules.
 */
@Module({
  imports: [
    // 1. Environment Variable Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Automated Task Scheduling (Cron Jobs)
    ScheduleModule.forRoot(),

    // 3. PostgreSQL TypeORM Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const isCloudPostgres =
          databaseUrl?.includes('neon.tech') ||
          databaseUrl?.includes('render.com') ||
          databaseUrl?.includes('supabase.co') ||
          databaseUrl?.includes('sslmode=require');

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Subscription, Reminder],
            synchronize: true, // Creates/synchronizes tables automatically
            ssl:
              isProduction || isCloudPostgres
                ? { rejectUnauthorized: false }
                : false,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get<number>('DB_PORT', 5432)),
          username: configService.get<string>('DB_USER', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'subscriptions_db'),
          entities: [Subscription, Reminder],
          synchronize: true,
        };
      },
    }),

    // 4. Feature Modules
    SubscriptionsModule,
    RemindersModule,
  ],
})
export class AppModule {}

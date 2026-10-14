import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application.
 * Configures CORS, global validation pipes, and Swagger OpenAPI documentation.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors();

  // 2. Global Request Validation Pipe (enforcing class-validator DTO constraints)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not defined in the DTO
      forbidNonWhitelisted: false,
      transform: true, // Automatically transforms payloads to DTO class instances
    }),
  );

  // 3. Swagger OpenAPI Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Subscription & Payment Reminder API')
    .setDescription(
      'A production-ready NestJS REST API for managing recurring subscriptions, ' +
        'dispatching automated payment reminders via cron jobs, and bulk-importing via CSV.',
    )
    .setVersion('1.0')
    .addTag('Subscriptions', 'CRUD operations, status filtering, and CSV batch import')
    .addTag('Reminders', 'Payment reminder history and manual cron trigger endpoint')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-user-id',
        in: 'header',
        description: 'User ID for multi-tenant data isolation (default: default-user-1)',
      },
      'x-user-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerOptions = {
    customSiteTitle: 'Subscription Reminder API Docs',
  };

  // Mount Swagger on /api/docs (industry standard), /api, and /docs
  SwaggerModule.setup('api/docs', app, document, swaggerOptions);
  SwaggerModule.setup('api', app, document, swaggerOptions);
  SwaggerModule.setup('docs', app, document, swaggerOptions);

  // Friendly root redirect to /api/docs so landing on the root domain opens the docs
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.redirect('/api/docs');
  });

  // 4. Start HTTP Server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Interactive Swagger API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();

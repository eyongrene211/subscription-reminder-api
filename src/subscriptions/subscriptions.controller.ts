import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  FilterSubscriptionDto,
  CsvImportResponseDto,
} from './dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Subscription } from './entities/subscription.entity';

/**
 * Shape of the multipart uploaded file.
 */
interface UploadedCsvFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size?: number;
}

/**
 * Controller managing subscription CRUD operations and CSV batch imports.
 */
@ApiTags('Subscriptions')
@ApiHeader({
  name: 'x-user-id',
  description: 'Unique user identifier for data isolation (defaults to default-user-1)',
  required: false,
})
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'The subscription has been successfully created.',
    type: Subscription,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @CurrentUser() userId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.create(createSubscriptionDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'List user subscriptions (with optional status filter)',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of user subscriptions.',
    type: [Subscription],
  })
  findAll(
    @CurrentUser() userId: string,
    @Query() filter: FilterSubscriptionDto,
  ): Promise<Subscription[]> {
    return this.subscriptionsService.findAllForUser(userId, filter);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import subscriptions from a CSV file',
    description:
      'Accepts a CSV file with columns: name, amount, billingDate, billingCycle',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The CSV file containing subscription records',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Summary of imported rows and row-level rejection errors.',
    type: CsvImportResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: UploadedCsvFile,
    @CurrentUser() userId: string,
  ): Promise<CsvImportResponseDto> {
    if (!file) {
      throw new BadRequestException('A CSV file must be provided in the "file" field.');
    }

    const isCsvMime =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/plain';
    const isCsvExt = file.originalname.toLowerCase().endsWith('.csv');

    if (!isCsvMime && !isCsvExt) {
      throw new BadRequestException('Only CSV files are accepted.');
    }

    return this.subscriptionsService.importFromCsv(file.buffer, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'The subscription record.',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.findOneForUser(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing subscription' })
  @ApiResponse({
    status: 200,
    description: 'The updated subscription.',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() userId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(id, updateSubscriptionDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.subscriptionsService.remove(id, userId);
  }
}

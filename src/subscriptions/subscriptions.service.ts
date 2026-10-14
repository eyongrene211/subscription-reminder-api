import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { Subscription } from './entities/subscription.entity';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  FilterSubscriptionDto,
  CsvImportResponseDto,
  ImportErrorDetail,
} from './dto';
import { BillingCycle, SubscriptionStatus } from '../common/enums';
import { calculateNextBillingDate } from '../common/utils/date-calc.util';

/**
 * Service managing user subscription operations, next billing date calculations,
 * and CSV batch imports.
 */
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  /**
   * Creates a new subscription for a user, computing its initial next billing date.
   *
   * @param dto - Validated subscription creation payload
   * @param userId - Owner user ID for data isolation
   * @returns Newly created Subscription entity
   */
  async create(
    dto: CreateSubscriptionDto,
    userId: string,
  ): Promise<Subscription> {
    const nextDate = calculateNextBillingDate(
      dto.billingDate,
      dto.billingCycle,
    );

    const subscription = this.subscriptionRepo.create({
      ...dto,
      nextBillingDate: nextDate.toISOString().split('T')[0],
      status: dto.status || SubscriptionStatus.ACTIVE,
      userId,
    });

    return await this.subscriptionRepo.save(subscription);
  }

  /**
   * Retrieves all subscriptions belonging to a user, with optional status filter.
   *
   * @param userId - ID of the user requesting their subscriptions
   * @param filter - Optional status filter (ACTIVE or CANCELLED)
   * @returns Array of Subscription records
   */
  async findAllForUser(
    userId: string,
    filter?: FilterSubscriptionDto,
  ): Promise<Subscription[]> {
    const where: any = { userId };
    if (filter?.status) {
      where.status = filter.status;
    }

    return await this.subscriptionRepo.find({
      where,
      order: { nextBillingDate: 'ASC' },
    });
  }

  /**
   * Retrieves a single subscription by ID for a user.
   * Enforces user isolation by querying on both subscription ID and user ID.
   *
   * @param id - Subscription UUID
   * @param userId - User ID of the requester
   * @returns The matching Subscription entity
   * @throws NotFoundException if the subscription does not exist or belongs to another user
   */
  async findOneForUser(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, userId },
      relations: { reminders: true },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription with ID "${id}" was not found or you do not have permission to access it.`,
      );
    }

    return subscription;
  }

  /**
   * Updates an existing subscription for a user.
   * Automatically recalculates nextBillingDate if billingDate or billingCycle was altered.
   *
   * @param id - Subscription UUID
   * @param dto - Partial update payload
   * @param userId - User ID of the requester
   * @returns The updated Subscription entity
   */
  async update(
    id: string,
    dto: UpdateSubscriptionDto,
    userId: string,
  ): Promise<Subscription> {
    const existing = await this.findOneForUser(id, userId);

    const updatedBillingDate = dto.billingDate || existing.billingDate;
    const updatedCycle = dto.billingCycle || existing.billingCycle;

    if (dto.billingDate || dto.billingCycle) {
      const nextDate = calculateNextBillingDate(
        updatedBillingDate,
        updatedCycle,
      );
      existing.nextBillingDate = nextDate.toISOString().split('T')[0];
    }

    Object.assign(existing, dto);
    return await this.subscriptionRepo.save(existing);
  }

  /**
   * Permanently deletes a subscription owned by a user.
   *
   * @param id - Subscription UUID
   * @param userId - User ID of the requester
   * @returns Success confirmation message
   */
  async remove(
    id: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const existing = await this.findOneForUser(id, userId);
    await this.subscriptionRepo.remove(existing);

    return {
      success: true,
      message: `Subscription "${existing.name}" has been successfully deleted.`,
    };
  }

  /**
   * Imports subscriptions from an uploaded CSV file buffer.
   * Validates each row individually, skips invalid rows, and returns a detailed summary.
   *
   * Required CSV header: name,amount,billingDate,billingCycle
   *
   * @param fileBuffer - Raw buffer of the uploaded CSV file
   * @param userId - ID of the user importing the subscriptions
   * @returns CsvImportResponseDto summary of successes and row-level errors
   */
  async importFromCsv(
    fileBuffer: Buffer,
    userId: string,
  ): Promise<CsvImportResponseDto> {
    let records: any[];

    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseError: any) {
      throw new BadRequestException(
        `Failed to parse CSV file: ${parseError.message}`,
      );
    }

    const errors: ImportErrorDetail[] = [];
    const validEntities: Subscription[] = [];

    records.forEach((row, index) => {
      // Row numbers are 1-based, plus 1 for the header line = index + 2
      const rowNumber = index + 2;

      // 1. Validate Name
      if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
        errors.push({ row: rowNumber, message: 'Name is required' });
        return;
      }

      // 2. Validate Amount
      const parsedAmount = parseFloat(row.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        errors.push({
          row: rowNumber,
          message: 'Amount must be greater than zero',
        });
        return;
      }

      // 3. Validate Billing Cycle
      const rawCycle = (row.billingCycle || '').toUpperCase();
      if (rawCycle !== BillingCycle.MONTHLY && rawCycle !== BillingCycle.YEARLY) {
        errors.push({
          row: rowNumber,
          message: 'Invalid billing cycle. Must be MONTHLY or YEARLY',
        });
        return;
      }

      // 4. Validate Billing Date
      const parsedDate = new Date(row.billingDate);
      if (isNaN(parsedDate.getTime()) || !/^\d{4}-\d{2}-\d{2}/.test(row.billingDate)) {
        errors.push({
          row: rowNumber,
          message: 'Invalid billing date format (expected YYYY-MM-DD)',
        });
        return;
      }

      // Calculate next billing date
      const nextDate = calculateNextBillingDate(row.billingDate, rawCycle as BillingCycle);

      const subscription = this.subscriptionRepo.create({
        name: row.name.trim(),
        amount: parsedAmount,
        billingDate: row.billingDate,
        nextBillingDate: nextDate.toISOString().split('T')[0],
        billingCycle: rawCycle as BillingCycle,
        status: SubscriptionStatus.ACTIVE,
        userId,
        userEmail: row.email || null,
      });

      validEntities.push(subscription);
    });

    if (validEntities.length > 0) {
      await this.subscriptionRepo.save(validEntities);
    }

    return {
      totalRows: records.length,
      imported: validEntities.length,
      rejected: errors.length,
      errors,
    };
  }
}

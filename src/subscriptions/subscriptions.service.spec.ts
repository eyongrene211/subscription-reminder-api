import { SubscriptionsService } from './subscriptions.service';
import { BillingCycle } from '../common/enums';
import { NotFoundException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) =>
        Promise.resolve(Array.isArray(entity) ? entity : { id: 'uuid-1', ...entity }),
      ),
      find: jest.fn(() => Promise.resolve([])),
      findOne: jest.fn(),
      remove: jest.fn(() => Promise.resolve()),
    };

    service = new SubscriptionsService(mockRepo);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription and compute nextBillingDate', async () => {
      const dto = {
        name: 'Netflix',
        amount: 15.99,
        billingDate: '2026-10-20',
        billingCycle: BillingCycle.MONTHLY,
      };

      const result = await service.create(dto, 'user-1');
      expect(result.name).toBe('Netflix');
      expect(result.userId).toBe('user-1');
      expect(result.nextBillingDate).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('findOneForUser', () => {
    it('should return subscription if user owns it', async () => {
      const sub = { id: 'sub-1', userId: 'user-1', name: 'Spotify' };
      mockRepo.findOne.mockResolvedValue(sub);

      const result = await service.findOneForUser('sub-1', 'user-1');
      expect(result).toEqual(sub);
    });

    it('should throw NotFoundException if subscription does not exist or wrong user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOneForUser('sub-999', 'user-2'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('importFromCsv', () => {
    it('should validate and import valid CSV rows while reporting errors for invalid rows', async () => {
      const csvContent =
        'name,amount,billingDate,billingCycle\n' +
        'Spotify,9.99,2026-11-01,MONTHLY\n' +
        'Broken,-5.00,2026-11-01,MONTHLY\n' +
        'BadCycle,10.00,2026-11-01,HOURLY\n';

      const buffer = Buffer.from(csvContent);
      const result = await service.importFromCsv(buffer, 'user-1');

      expect(result.totalRows).toBe(3);
      expect(result.imported).toBe(1);
      expect(result.rejected).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0].message).toContain('greater than zero');
      expect(result.errors[1].message).toContain('Invalid billing cycle');
    });
  });
});

import { RemindersService } from './reminders.service';
import { SubscriptionStatus } from '../common/enums';

describe('RemindersService', () => {
  let service: RemindersService;
  let mockReminderRepo: any;
  let mockSubscriptionRepo: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockReminderRepo = {
      findOne: jest.fn(),
      find: jest.fn(() => Promise.resolve([])),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'rem-1', ...entity })),
    };

    mockSubscriptionRepo = {
      find: jest.fn(),
    };

    mockEmailService = {
      sendPaymentReminder: jest.fn(() =>
        Promise.resolve({ success: true, messageId: 'msg-1' }),
      ),
    };

    service = new RemindersService(
      mockReminderRepo,
      mockSubscriptionRepo,
      mockEmailService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeReminderScan', () => {
    it('should send reminders for subscriptions due within 3 days', async () => {
      const today = new Date('2026-10-14');
      const upcomingSub = {
        id: 'sub-1',
        name: 'Netflix',
        amount: 15.99,
        nextBillingDate: '2026-10-15',
        status: SubscriptionStatus.ACTIVE,
        userId: 'user-1',
        userEmail: 'user@example.com',
      };

      mockSubscriptionRepo.find.mockResolvedValue([upcomingSub]);
      mockReminderRepo.findOne.mockResolvedValue(null); // No previous reminder

      const result = await service.executeReminderScan(today);

      expect(result.scannedSubscriptions).toBe(1);
      expect(result.remindersSent).toBe(1);
      expect(result.duplicateRemindersPrevented).toBe(0);
      expect(mockEmailService.sendPaymentReminder).toHaveBeenCalledWith(
        'user@example.com',
        'Netflix',
        15.99,
        '2026-10-15',
      );
      expect(mockReminderRepo.save).toHaveBeenCalled();
    });

    it('should PREVENT duplicate reminders for the same subscription and billing date', async () => {
      const today = new Date('2026-10-14');
      const upcomingSub = {
        id: 'sub-1',
        name: 'Netflix',
        amount: 15.99,
        nextBillingDate: '2026-10-15',
        status: SubscriptionStatus.ACTIVE,
        userId: 'user-1',
      };

      mockSubscriptionRepo.find.mockResolvedValue([upcomingSub]);
      // Simulate that a reminder was ALREADY sent
      mockReminderRepo.findOne.mockResolvedValue({
        id: 'existing-reminder',
        subscriptionId: 'sub-1',
        billingDate: '2026-10-15',
      });

      const result = await service.executeReminderScan(today);

      expect(result.scannedSubscriptions).toBe(1);
      expect(result.remindersSent).toBe(0);
      expect(result.duplicateRemindersPrevented).toBe(1); // Duplicate prevented!
      expect(mockEmailService.sendPaymentReminder).not.toHaveBeenCalled();
      expect(mockReminderRepo.save).not.toHaveBeenCalled();
    });
  });
});

/**
 * Supported recurring billing cycle frequencies for subscriptions.
 */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

/**
 * Lifecycle status of a subscription.
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
}

/**
 * Dispatch status of an automated payment reminder.
 */
export enum ReminderStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

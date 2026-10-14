-- PostgreSQL Schema Definition for Subscription & Payment Reminder API
-- Compatible with PostgreSQL 14, 15, and 16+

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE billing_cycle_enum AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM ('ACTIVE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status_enum AS ENUM ('SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    "billingDate" DATE NOT NULL,
    "nextBillingDate" DATE NOT NULL,
    "billingCycle" billing_cycle_enum NOT NULL DEFAULT 'MONTHLY',
    status subscription_status_enum NOT NULL DEFAULT 'ACTIVE',
    "userId" VARCHAR(255) NOT NULL,
    "userEmail" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes on Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions ("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_nextBillingDate ON subscriptions ("nextBillingDate");

-- 3. Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "subscriptionId" UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    "billingDate" DATE NOT NULL,
    status reminder_status_enum NOT NULL DEFAULT 'SUCCESS',
    "recipientEmail" VARCHAR(255) NOT NULL,
    "failureReason" TEXT,
    "sentAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Composite Unique Index for Duplicate Reminder Prevention
-- Guarantees that at most one reminder can exist per (subscriptionId, billingDate)
CREATE UNIQUE INDEX IF NOT EXISTS uq_reminder_subscription_date 
ON reminders ("subscriptionId", "billingDate");

CREATE INDEX IF NOT EXISTS idx_reminders_subscriptionId ON reminders ("subscriptionId");

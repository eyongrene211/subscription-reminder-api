# Subscription and Payment Reminder API 🚀

[![Repository](https://img.shields.io/badge/GitHub-eyongrene211%2Fsubscription--reminder--api-blue?logo=github)](https://github.com/eyongrene211/subscription-reminder-api)
[![NestJS](https://img.shields.io/badge/NestJS-v12-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-orange?logo=typeorm)](https://typeorm.io/)
[![Tests](https://img.shields.io/badge/Tests-31%20Passing-brightgreen?logo=jest)](https://jestjs.io/)

A production-grade backend application built with **Node.js, NestJS, TypeScript, TypeORM, and PostgreSQL**. The system empowers users to manage recurring subscriptions, automatically dispatches daily payment reminders via automated cron jobs, prevents duplicate alerts, and supports bulk CSV data imports with row-level validation.

---

## 🌐 Deliverables & Live Links
* **Source Code Repository:** [https://github.com/eyongrene211/subscription-reminder-api](https://github.com/eyongrene211/subscription-reminder-api)
* **Deployed API Public URL:** `https://subscription-reminder-api.onrender.com` *(or your custom Render URL)*
* **Interactive Swagger UI:** `https://subscription-reminder-api.onrender.com/api` *(or `http://localhost:5000/api` locally)*
* **Postman Collection:** [`postman_collection.json`](file:///home/rapelo47/Rapelo's%20projects/Internship%20Project/TestAssement-projects/Backend-assessment/postman_collection.json)

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Part 1: Algorithmic Problem Solutions](#part-1-algorithmic-problem-solutions)
- [Part 2: Features & Endpoints](#part-2-features--endpoints)
- [Database Schema & Migration](#database-schema--migration)
- [Environment Variables](#environment-variables)
- [Local Installation & Setup](#local-installation--setup)
- [Testing the Cron Job (Without Waiting 24h)](#testing-the-cron-job-without-waiting-24h)
- [CSV Bulk Import Format](#csv-bulk-import-format)
- [Interactive Swagger Docs & Postman Collection](#interactive-swagger-docs--postman-collection)
- [Part 4: Cloud Deployment Guide (Render + Neon/PostgreSQL)](#part-4-cloud-deployment-guide)

---

## 🛠️ Architecture & Tech Stack

* **Framework:** [NestJS](https://nestjs.com/) v12 (Modular architecture, Dependency Injection, Guards, Pipes, Decorators)
* **Language:** TypeScript 5+ (Strict mode)
* **Database ORM:** [TypeORM](https://typeorm.io/) with `pg` (PostgreSQL driver)
* **Database:** PostgreSQL 16
* **Task Scheduling:** `@nestjs/schedule` (Cron jobs)
* **Validation & Transformation:** `class-validator` & `class-transformer`
* **File Upload & CSV Parser:** Multer & `csv-parse`
* **API Documentation:** OpenAPI 3.0 via `@nestjs/swagger` + [Swagger UI](/api)
* **Testing:** Jest + SWC (`npm test`)

---

## 📂 Project Structure

```text
subscription-reminder-api/
├── algorithms/                           # 📂 Part 1: Algorithmic Solutions & Tests
│   ├── find-duplicates.ts                # Exercise 1: O(N) Hash Set Duplicate Finder
│   ├── longest-substring.ts              # Exercise 2: O(N) Sliding Window Substring
│   ├── group-anagrams.ts                 # Exercise 3: O(N * K log K) Hash Map Grouping
│   └── algorithms.spec.ts                # 15 Automated Unit Tests for Part 1
│
├── src/                                  # 📂 Part 2: Pure NestJS Production API
│   ├── common/                           # Cross-cutting Enums, Decorators & Utilities
│   │   ├── decorators/current-user.decorator.ts  # Multi-tenant data isolation header
│   │   ├── enums/index.ts                # BillingCycle, SubscriptionStatus, ReminderStatus
│   │   └── utils/date-calc.util.ts       # Next billing date & 3-day window calculators
│   ├── subscriptions/                    # Subscriptions Domain Module
│   │   ├── dto/                          # Create, Update, Filter, ImportResult DTOs
│   │   ├── entities/subscription.entity.ts # TypeORM Subscription Entity
│   │   ├── subscriptions.controller.ts   # CRUD routes & CSV upload handler
│   │   ├── subscriptions.service.ts      # Business logic & CSV row validation
│   │   └── subscriptions.module.ts
│   ├── reminders/                        # Reminders Domain Module
│   │   ├── entities/reminder.entity.ts   # TypeORM Reminder Audit Trail Entity
│   │   ├── email.service.ts              # Email notification transport & logger
│   │   ├── reminders.controller.ts       # History routes & manual cron trigger
│   │   ├── reminders.service.ts          # Daily cron runner & duplicate prevention
│   │   └── reminders.module.ts
│   ├── app.module.ts                     # Root Module (Config, DB, Schedule, Features)
│   └── main.ts                           # App entry point, CORS, ValidationPipe, Swagger
│
├── schema.sql                            # Standalone PostgreSQL DDL Schema Script
├── sample_subscriptions.csv              # Ready-to-test CSV file for import
├── postman_collection.json               # Importable Postman Collection v2.1
├── .env.example                          # Environment variable template
├── package.json                          # Root npm scripts for local & cloud deploy
└── README.md
```

---

## 🧠 Part 1: Algorithmic Problem Solutions

All algorithmic solutions are isolated in `algorithms/` and verified by 15 automated test cases:

### Run Algorithm Tests:
```bash
npm run test:algorithms
```

### 1. Exercise 1: Find Duplicate Numbers (`find-duplicates.ts`)
* **Strategy:** Uses two Hash Sets (`seen` and `duplicates`).
* **Time Complexity:** $O(N)$ — single pass over the numbers.
* **Space Complexity:** $O(N)$ — stores encountered elements in memory.
* **Edge Cases Covered:** Empty array, all unique elements, elements repeating >2 times (appears only once in result), negative numbers and zeros.

### 2. Exercise 2: Longest Substring Without Repeating Characters (`longest-substring.ts`)
* **Strategy:** Two-pointer **Sliding Window** technique with a `Set<string>`.
* **Time Complexity:** $O(N)$ — each character is visited at most twice (once by right pointer, once by left pointer).
* **Space Complexity:** $O(\min(N, \Sigma))$ — proportional to unique character alphabet size.
* **Edge Cases Covered:** Empty string (`0`), all identical chars (`1`), whitespace/spaces, special punctuation.

### 3. Exercise 3: Group Anagrams (`group-anagrams.ts`)
* **Strategy:** Hash Map with sorted character string as canonical bucket key (e.g. `"eat"` $\rightarrow$ `"aet"`).
* **Time Complexity:** $O(N \cdot K \log K)$, where $N$ is word count and $K$ is maximum word length.
* **Space Complexity:** $O(N \cdot K)$ to store grouped words in buckets.
* **Edge Cases Covered:** Empty array, single-character strings, words with no anagrams.

---

## ⚡ Part 2: Features & Endpoints

### Base URL: `http://localhost:5000` (or your deployed cloud URL)

### Subscriptions Endpoints:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/subscriptions` | Create a new subscription (calculates `nextBillingDate`) |
| `GET` | `/subscriptions` | List subscriptions (supports `?status=ACTIVE` or `CANCELLED`) |
| `GET` | `/subscriptions/:id` | Get details of a single subscription |
| `PATCH` | `/subscriptions/:id` | Update subscription (auto-recalculates billing date if altered) |
| `DELETE` | `/subscriptions/:id` | Delete a subscription |
| `POST` | `/subscriptions/import` | Bulk import subscriptions from CSV file |

### Reminders Endpoints:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/reminders/trigger` | **Manually trigger reminder scan** (Test without waiting 24h) |
| `GET` | `/reminders` | View all sent reminder history |
| `GET` | `/subscriptions/:id/reminders` | View reminder dispatch history for a specific subscription |

### 🔒 User Data Isolation
Pass the header `x-user-id: <user_id>` (e.g. `user-alpha` or `user-beta`).
* Every database query filters by `userId`.
* Users can **only view, edit, or delete their own subscriptions**.

---

## ⏰ Testing the Cron Job (Without Waiting 24h)

The cron job is scheduled to execute daily at midnight (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`).

To test the cron job immediately at any time:
```bash
curl -X POST http://localhost:5000/reminders/trigger
```

### What Happens:
1. Identifies all `ACTIVE` subscriptions whose `nextBillingDate` is within **the next 3 days**.
2. **Duplicate Prevention:** Checks the database for an existing reminder for `(subscriptionId, nextBillingDate)`. If one already exists, it **skips sending** and increments `duplicateRemindersPrevented`.
3. Dispatches reminder (logged to console with structured details per assessment rules).
4. Persists an audit record in the `reminders` table with status `SUCCESS` or `FAILED` and timestamp.
5. Returns a JSON summary:
```json
{
  "scannedSubscriptions": 1,
  "remindersSent": 1,
  "duplicateRemindersPrevented": 0,
  "failures": 0,
  "details": [
    {
      "subscriptionId": "776e9902-0b93-4d9a-bb1f-538e82a98893",
      "subscriptionName": "Netflix Premium",
      "billingDate": "2026-10-16",
      "status": "SUCCESS",
      "recipientEmail": "alpha@example.com"
    }
  ]
}
```
If you run it a second time, it outputs:
```json
{
  "scannedSubscriptions": 1,
  "remindersSent": 0,
  "duplicateRemindersPrevented": 1,
  "failures": 0,
  "details": []
}
```

---

## 📊 CSV Bulk Import Format

Use `POST /subscriptions/import` with `multipart/form-data` and a field named `file`.

### Accepted Columns:
`name,amount,billingDate,billingCycle`

### Sample CSV (`sample_subscriptions.csv`):
```csv
name,amount,billingDate,billingCycle
Spotify Family,14.99,2026-11-01,MONTHLY
AWS Hosting,45.50,2026-12-01,MONTHLY
Internet Fiber,-30.00,2026-11-15,MONTHLY
Cloudflare Domain,10.00,2027-01-10,YEARLY
Gym Membership,25.00,2026-11-20,WEEKLY
```

### Sample Response:
```json
{
  "totalRows": 5,
  "imported": 3,
  "rejected": 2,
  "errors": [
    {
      "row": 4,
      "message": "Amount must be greater than zero"
    },
    {
      "row": 6,
      "message": "Invalid billing cycle. Must be MONTHLY or YEARLY"
    }
  ]
}
```

---

## 💾 Database Schema & Migration

### Schema Creation:
You can use the standalone [`schema.sql`](file:///home/rapelo47/Rapelo's%20projects/Internship%20Project/TestAssement-projects/Backend-assessment/schema.sql) file to provision the database in any PostgreSQL instance:
```bash
psql -U <username> -d subscription_reminder_db -f schema.sql
```
*Note: In development and production, TypeORM automatically synchronizes the entities upon startup (`synchronize: true`).*

---

## 💻 Local Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/eyongrene211/subscription-reminder-api.git
cd subscription-reminder-api
npm install
```

### 2. Configure Environment Variables
Copy the template:
```bash
cp .env.example .env
```
Edit `.env` to match your database credentials:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/subscription_reminder_db
```

### 3. Run All Automated Tests
```bash
npm test
```

### 4. Start the Application
```bash
# Development mode with watch
npm run start:dev

# Production build & start
npm run build
npm run start:prod
```

### 5. Access Interactive Swagger Docs
Open your browser at:  
👉 **`http://localhost:5000/api`**

---

## 🌐 Part 4: Cloud Deployment Guide

### Deploying to Render + Neon/Render PostgreSQL:

1. **Database Setup (Neon.tech or Render Postgres):**
   * Create a free PostgreSQL instance on [Neon.tech](https://neon.tech) or on [Render](https://render.com).
   * Copy the connection string (`DATABASE_URL`).

2. **Web Service Setup (Render):**
   * Push your code to GitHub.
   * On Render, click **New + > Web Service** and select `eyongrene211/subscription-reminder-api`.
   * Set:
     * **Environment:** `Node`
     * **Build Command:** `npm install && npm run build`
     * **Start Command:** `npm run start:prod`
   * Add Environment Variables in the Render Dashboard:
     * `NODE_ENV` = `production`
     * `DATABASE_URL` = `<your_cloud_postgres_connection_string>`
     * `PORT` = `10000` (or Render's default)
   * Click **Deploy Web Service**!

3. **Verify Deployment:**
   * Open `https://your-service.onrender.com/api` in your browser to verify Swagger UI.
   * Test endpoints using Swagger or the provided Postman collection.

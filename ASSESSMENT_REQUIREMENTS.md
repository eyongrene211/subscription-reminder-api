# Backend Assessment Requirements

**Technologies:** Node.js, NestJS, TypeScript, PostgreSQL  
**Deadline:** Today at 6:00 PM  

---

## Part 1 – Algorithmic Problems

### Exercise 1: Find Duplicate Numbers
Given an array of integers, return all numbers that appear more than once. Each duplicate should appear only once in the result.

**Examples:**
- Input: `[1, 2, 3, 2, 4, 5, 1]` → Output: `[1, 2]`
- Input: `[1, 2, 3, 4]` → Output: `[]`

### Exercise 2: Longest Substring Without Repeating Characters
Given a string, find the length of the longest substring without repeated characters.

**Examples:**
- Input: `"abcabcbb"` → Output: `3`
- Input: `"bbbbb"` → Output: `1`
- Input: `"pwwkew"` → Output: `3`

### Exercise 3: Group Anagrams
Given an array of strings, group words that are anagrams of one another. The order of the groups does not matter.

**Example:**
- Input: `["eat", "tea", "tan", "ate", "nat", "bat"]`  
- Output: `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`

---

## Part 2 – Practical Exercises (NestJS)

### Exercise 1: Subscription and Payment Reminder API
**Goal:** Build an API that allows users to manage subscriptions and automatically receive reminders before their subscriptions require payment (e.g., Netflix, Spotify, internet plans, and domain names).

**Subscription Entity Fields:**
- `id`
- `name`
- `amount`
- `billingDate`
- `billingCycle` (`MONTHLY`, `YEARLY`)
- `status` (`ACTIVE`, `CANCELLED`)
- `userId`
- `createdAt`
- `updatedAt`

**Requirements:**
- Implement CRUD endpoints for subscriptions.
- Allow users to view their active subscriptions and filter by status.
- Calculate the next billing date based on the billing cycle.
- Validate incoming data using `class-validator`.
- Store subscriptions in a relational database using TypeORM or Prisma.
- Ensure users can only manage their own subscriptions.

### Exercise 2: Automated Payment Reminders Using Cron Jobs
**Goal:** Automatically identify subscriptions approaching their billing date and notify their owners.

**Requirements:**
- Use `@nestjs/schedule` to run a task daily.
- Identify active subscriptions whose next billing date falls within the next three days.
- Send reminder emails to subscription owners.
- Prevent duplicate reminders for the same subscription and billing date.
- Store reminder history in the database, including sending status and timestamp.
- Handle email delivery failures appropriately.
- Provide endpoints to view reminder history:
  - `GET /subscriptions/:id/reminders`
  - `GET /reminders`
- *Note:* You may use a test email service or log reminder messages to the console if email credentials are unavailable.

### Exercise 3: CSV Subscription Import
**Goal:** Create a `POST /subscriptions/import` endpoint to import subscriptions from a CSV file.

**CSV Columns:** `name,amount,billingDate,billingCycle`

**Requirements:**
- Accept only CSV files.
- Parse and validate each row.
- Import valid rows into the database.
- Skip invalid rows and report their row numbers and errors.
- Return a summary of successful and failed imports.

**Example Response:**
```json
{
  "totalRows": 5,
  "imported": 3,
  "rejected": 2,
  "errors": [
    {
      "row": 3,
      "message": "Amount must be greater than zero"
    },
    {
      "row": 5,
      "message": "Invalid billing cycle"
    }
  ]
}
```

---

## Part 3 – Code Quality and Delivery
- Organize the application using NestJS modules, controllers, services, DTOs, and entities.
- Use environment variables for credentials and secrets.
- Handle errors with appropriate HTTP status codes.
- Provide database migrations or setup instructions.
- Provide a README with installation and usage instructions.
- Provide API documentation or a Postman collection.

---

## Part 4 – Deployment
**Goal:** Deploy the backend API so it can be accessed online.
- Deploy the NestJS application to a hosting platform of your choice (Free hosting services may be used).
- Configure a production database.
- Set the required environment variables securely.
- Ensure the deployed API is accessible through a public URL.
- Verify that the API endpoints work in the deployed environment.
- Include the deployed API URL in your submission.
- Provide instructions for testing the cron job without waiting until the next day.

---

## Deliverables
1. A working NestJS API.
2. Source code hosted in a Git repository.
3. A publicly accessible deployed API URL.
4. README with setup and deployment instructions.
5. API documentation or Postman collection.
6. Instructions for testing the scheduled task.

---

## Evaluation Criteria
- Correctness of algorithmic solutions.
- NestJS architecture and code organization.
- Database design and query handling.
- Cron job implementation and prevention of duplicate reminders.
- Input validation and error handling.
- Security and user data isolation.
- Successful deployment and configuration.
- Code readability and maintainability.

**Final deadline:** Today at 6:00 PM.  
By the deadline, both the source code and the deployed API must be submitted. Ensure that your repository is accessible and that your deployment URL works.

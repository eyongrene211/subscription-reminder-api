import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the active user ID from the request.
 *
 * Checks the 'x-user-id' header, enabling seamless user data isolation
 * across API calls, Postman tests, and Swagger interactive requests.
 * Defaults to 'default-user-1' if omitted, guaranteeing easy testing.
 *
 * @example
 * ```typescript
 * @Get()
 * getMySubscriptions(@CurrentUser() userId: string) {
 *   return this.subscriptionsService.findAllForUser(userId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const userIdHeader = request.headers['x-user-id'];

    if (userIdHeader) {
      return Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    }

    return 'default-user-1';
  },
);

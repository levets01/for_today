import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppUser } from '../guards/auth.guard.js';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AppUser => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as AppUser;
});

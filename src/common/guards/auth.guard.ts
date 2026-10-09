import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

export type AppUser = { username: string; role: 'admin' | 'supervisor' | 'asesor' };

const USERS: AppUser[] = [
  { username: 'admin', role: 'admin' },
  { username: 'supervisor', role: 'supervisor' },
  { username: 'asesor1', role: 'asesor' },
  { username: 'asesor2', role: 'asesor' },
];

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    if (!apiKey) throw new UnauthorizedException('x-api-key required');

    const allowed = (process.env.API_KEYS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!allowed.includes(String(apiKey))) throw new UnauthorizedException('invalid api key');

    const xuser = req.headers['x-user'] || req.headers['X-USER'];
    if (!xuser) throw new UnauthorizedException('x-user required');

    const user = USERS.find((u) => u.username === String(xuser));
    if (!user) throw new UnauthorizedException('invalid user');

    // attach user
    req.user = user;

    // roles metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    if (requiredRoles.includes(user.role)) return true;
    throw new ForbiddenException('insufficient role');
  }
}

export { USERS };

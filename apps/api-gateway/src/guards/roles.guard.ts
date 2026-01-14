// apps/api-gateway/src/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // Si no se especifican roles, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Verificar si el rol del usuario está en los roles requeridos
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role ${user.role} not allowed. Required roles: ${requiredRoles.join(
          ', ',
        )}`,
      );
    }

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException(`Role ${user.role} not allowed`);
    }

    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      // Llamar al Auth Service para validar el token
      const validationResult = await lastValueFrom(
        this.authClient.send({ cmd: 'auth.validateToken' }, { token }),
      );

      if (!validationResult.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      // Agregar información del usuario al request
      request.user = {
        id: validationResult.user.id,
        role: validationResult.user.role,
      };

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

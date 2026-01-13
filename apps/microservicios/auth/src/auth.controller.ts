import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly usersServiceService: AuthService) {}

  @Get()
  getHello(): string {
    return this.usersServiceService.getHello();
  }
}

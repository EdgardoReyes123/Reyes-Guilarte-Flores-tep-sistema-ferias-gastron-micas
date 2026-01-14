import { UserRole } from '../register.dto';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
}

export class ValidateTokenResponseDto {
  valid: boolean;
  user?: UserResponseDto;
  error?: string;
}

export class HealthResponseDto {
  status: string;
  service: string;
  timestamp: string;
  database: string;
  error?: string;
}

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SELLER = 'seller',
}

export class RegisterDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  fullname: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser user, admin o seller' })
  @Transform(({ value }) => value || UserRole.USER)
  role?: UserRole;
}

import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  password: string;
}

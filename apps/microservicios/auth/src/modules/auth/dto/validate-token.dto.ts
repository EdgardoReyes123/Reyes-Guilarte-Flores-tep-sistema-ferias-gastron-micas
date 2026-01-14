import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ValidateTokenDto {
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token es requerido' })
  @MinLength(10, { message: 'El token es inválido' })
  token: string;
}

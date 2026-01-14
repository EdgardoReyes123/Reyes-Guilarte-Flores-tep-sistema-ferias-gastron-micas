import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class GetUserDto {
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsUUID('4', { message: 'El ID debe ser un UUID válido' })
  id: string;
}

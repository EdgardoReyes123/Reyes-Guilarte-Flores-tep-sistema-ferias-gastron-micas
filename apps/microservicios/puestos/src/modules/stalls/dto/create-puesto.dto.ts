// microservicios/puestos/src/puestos/dto/create-puesto.dto.ts
import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreatePuestoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;
}

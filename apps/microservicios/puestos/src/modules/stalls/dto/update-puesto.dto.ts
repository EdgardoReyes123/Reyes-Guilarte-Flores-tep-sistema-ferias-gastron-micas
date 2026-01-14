// microservicios/puestos/src/puestos/dto/update-puesto.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePuestoDto } from './create-puesto.dto';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { PuestoStatus } from '../../../interfaces/puesto.interface';

export class UpdatePuestoDto extends PartialType(CreatePuestoDto) {
  @IsEnum(PuestoStatus)
  @IsOptional()
  status?: PuestoStatus;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

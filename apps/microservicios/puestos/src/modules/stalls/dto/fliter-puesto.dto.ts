import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PuestoStatus } from '../../../interfaces/puesto.interface';

export class FilterPuestoDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(PuestoStatus)
  @IsOptional()
  status?: PuestoStatus;

  @IsBoolean()
  @IsOptional()
  onlyActive?: boolean;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;
}


import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FiltroEventoAdminDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  local?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

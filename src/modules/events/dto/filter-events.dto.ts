
import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FiltroEventoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  local?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;
}

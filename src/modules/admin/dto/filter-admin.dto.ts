
import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoUsuario } from '../../../generated/prisma/enums.js';

export class FiltroAdminDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(TipoUsuario)
  tipo?: TipoUsuario;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

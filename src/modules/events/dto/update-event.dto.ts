import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
} from 'class-validator';

export class AtualizarEventoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descricao?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  local?: string;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsInt()
  categoriaId?: number;
}

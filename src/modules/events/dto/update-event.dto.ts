
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsIn,
  Matches,
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
  @IsString()
  @IsNotEmpty()
  cidade?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsIn(['EXATA', 'APROXIMADA'])
  precisaoLocalizacao?: 'EXATA' | 'APROXIMADA';

  @IsOptional()
  @IsString()
  @Matches(
    /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i,
    {
      message: 'Informe o caminho de uma imagem enviada pelo sistema.',
    },
  )
  imagemUrl?: string | null;

  @IsOptional()
  @IsInt()
  categoriaId?: number;
}

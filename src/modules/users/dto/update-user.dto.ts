import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const CATEGORIAS_PREFERENCIA = [
  'Esporte',
  'Cultura',
  'Natureza',
  'Música',
  'Feira',
  'Gastronomia',
] as const;

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidadePreferida?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsIn([...CATEGORIAS_PREFERENCIA], { each: true })
  interesses?: string[];
}

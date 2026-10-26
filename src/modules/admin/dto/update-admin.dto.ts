
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { TipoUsuario } from '../../../generated/prisma/enums.js';

export class AtualizarUsuarioAdminDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(TipoUsuario)
  tipo?: TipoUsuario;
}

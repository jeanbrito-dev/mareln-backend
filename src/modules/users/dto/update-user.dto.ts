import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
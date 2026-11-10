import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  senhaAtual: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  novaSenha: string;
}
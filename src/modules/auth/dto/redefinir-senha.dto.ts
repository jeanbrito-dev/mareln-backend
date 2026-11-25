import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString({ message: 'Token de recuperação inválido.' })
  @IsNotEmpty({ message: 'O token de recuperação é obrigatório.' })
  token: string;

  @IsString({ message: 'A nova senha deve ser uma string.' })
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' })
  novaSenha: string;
}

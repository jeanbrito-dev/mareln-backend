import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecuperarSenhaDto {
  @IsEmail({}, { message: 'Informe um endereço de e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;
}

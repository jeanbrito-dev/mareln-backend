
import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CriarCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}

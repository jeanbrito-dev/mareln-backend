
import { PartialType } from '@nestjs/mapped-types';
import { CriarCategoriaDto } from './criar-categoria.dto.js';

export class AtualizarCategoriaDto extends PartialType(
  CriarCategoriaDto,
) {}

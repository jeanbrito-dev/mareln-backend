
import { PartialType } from '@nestjs/mapped-types';
import { CriarCategoriaDto } from '../../categories/dto/criar-categoria.dto.js';

export class AtualizarCategoriaDto extends PartialType(
  CriarCategoriaDto,
) {}

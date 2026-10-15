import { PartialType } from '@nestjs/mapped-types';
import { CriarEventoDto } from './create-event.dto.js';

export class AtualizarEventoDto extends PartialType(
    CriarEventoDto,
) { }

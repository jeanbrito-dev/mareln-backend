import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-user.dto.js';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}

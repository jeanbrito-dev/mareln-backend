import { IsIn } from 'class-validator';

export class AtualizarStatusEventoAdminDto {
  @IsIn(['APROVADO', 'REJEITADO'])
  status!: 'APROVADO' | 'REJEITADO';
}
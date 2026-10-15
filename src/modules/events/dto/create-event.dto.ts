
import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsInt,
    IsOptional,
} from 'class-validator';

export class CriarEventoDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsDateString()
    data: string;

    @IsString()
    @IsNotEmpty()
    local: string;

    @IsInt()
    usuarioId: number;

    @IsOptional()
    @IsInt()
    categoriaId?: number;
}

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CommentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    conteudo: string;
}
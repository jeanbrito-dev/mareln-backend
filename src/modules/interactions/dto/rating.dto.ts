import { IsInt, Min, Max } from 'class-validator';

export class RatingDto {
    @IsInt()
    @Min(1)
    @Max(5)
    nota: number;
}
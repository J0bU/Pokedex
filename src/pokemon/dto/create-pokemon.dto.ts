import { IsInt, IsPositive, IsString, MinLength } from "class-validator";

export class CreatePokemonDto {
    
    @IsInt()
    @IsPositive()
    no: number;

    @MinLength(3)
    @IsString()
    name: string;
}

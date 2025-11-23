import { IsString, MinLength } from "class-validator";

export class CreateTagDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @MinLength(3)
    description: string;

    @IsString()
    @MinLength(3)
    slug: string;
    
    @IsString()
    @MinLength(3)
    userId: string;
}
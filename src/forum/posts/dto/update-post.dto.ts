import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpdatePostDto {
    @IsString()
    @MinLength(1)
    @IsOptional()
    title?: string;
    
    @IsString()
    @MinLength(1)
    @IsOptional()
    content?: string;

    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
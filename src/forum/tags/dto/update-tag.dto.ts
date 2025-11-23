import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateTagDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    title?: string;
    
    @IsString()
    @IsOptional()
    @MinLength(1)
    description?: string;
    
    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
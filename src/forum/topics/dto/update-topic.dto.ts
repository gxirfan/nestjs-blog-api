import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateTopicDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    title?: string;
    
    @IsString()
    @IsOptional()
    @MinLength(1)
    content?: string;
    
    @IsString()
    @IsOptional()
    @MinLength(1)
    tagId?: string;

    @IsNumber()
    @IsOptional()
    postCount?: number;

    @IsDate()
    @IsOptional()
    lastPostAt?: Date;
    
    @IsBoolean()
    @IsOptional()
    status?: boolean;

    @IsString()
    @IsOptional()
    slug?: string;
}